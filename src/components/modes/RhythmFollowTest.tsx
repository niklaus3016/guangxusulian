import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppSettings, TestRecord } from '../../types';
import { triggerHitFeedback, triggerMissFeedback } from '../../utils/feedback';
import { CountdownOverlay } from '../CountdownOverlay';

interface RhythmFollowTestProps {
  settings: AppSettings;
  onFinish: (record: TestRecord) => void;
  onExit: () => void;
}

type SpeedPreset = 'slow' | 'medium' | 'fast' | 'extreme';
type OrderPreset = 'fixed' | 'random';

const SPEED_CONFIG: Record<SpeedPreset, { label: string; intervalMs: number }> = {
  slow: { label: '慢速 (650ms)', intervalMs: 650 },
  medium: { label: '中速 (480ms)', intervalMs: 480 },
  fast: { label: '快速 (350ms)', intervalMs: 350 },
  extreme: { label: '极速 (250ms)', intervalMs: 250 },
};

const TOTAL_BEATS = 20;
const PAD_COUNT = 4;

export const RhythmFollowTest: React.FC<RhythmFollowTestProps> = ({
  settings,
  onFinish,
  onExit,
}) => {
  const [speed, setSpeed] = useState<SpeedPreset>('medium');
  const [order, setOrder] = useState<OrderPreset>('fixed');
  const [phase, setPhase] = useState<'setup' | 'countdown' | 'running'>('setup');

  const [currentBeat, setCurrentBeat] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [padFeedback, setPadFeedback] = useState<{ index: number; type: 'hit' | 'miss' } | null>(null);
  const [validHits, setValidHits] = useState(0);
  const [misses, setMisses] = useState(0);

  const sequenceRef = useRef<number[]>([]);
  const beatIndexRef = useRef(0);
  const beatStartTimeRef = useRef(0);
  const beatResolvedRef = useRef(false);
  const validRef = useRef(0);
  const missRef = useRef(0);
  const totalClicksRef = useRef(0);
  const offsetsRef = useRef<number[]>([]);
  const startTimeRef = useRef(0);
  const finishedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const intervalMs = SPEED_CONFIG[speed].intervalMs;

  const generateSequence = useCallback((): number[] => {
    const seq: number[] = [];
    for (let i = 0; i < TOTAL_BEATS; i++) {
      if (order === 'fixed') {
        seq.push(i % PAD_COUNT);
      } else {
        let next = Math.floor(Math.random() * PAD_COUNT);
        if (i > 0 && next === seq[i - 1]) {
          next = (next + 1 + Math.floor(Math.random() * (PAD_COUNT - 1))) % PAD_COUNT;
        }
        seq.push(next);
      }
    }
    return seq;
  }, [order]);

  const finalizeTest = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const valid = validRef.current;
    const miss = missRef.current;
    const total = Math.max(totalClicksRef.current, valid + miss);
    const costTime = (performance.now() - startTimeRef.current) / 1000;
    const avgOffsetMs =
      offsetsRef.current.length > 0
        ? offsetsRef.current.reduce((a, b) => a + b, 0) / offsetsRef.current.length
        : intervalMs;

    const hitRatio = valid / TOTAL_BEATS;
    const timingAccuracy = Math.max(0, 1 - avgOffsetMs / (intervalMs * 1.1));
    const rhythmIndex = Math.max(
      0,
      Math.min(100, Math.round(hitRatio * 75 + timingAccuracy * 25 - miss * 2)),
    );
    const accuracyPct = total > 0 ? Math.round((valid / total) * 1000) / 10 : 0;

    const record: TestRecord = {
      id: `rhythm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      modeType: 'rhythm_follow',
      createTime: Date.now(),
      score: rhythmIndex,
      cps: Number((valid / Math.max(costTime, 0.1)).toFixed(2)),
      reactionMs: null,
      totalClick: total,
      validClick: valid,
      miss,
      costTime: Number(costTime.toFixed(2)),
      details: {
        configLabel: `${SPEED_CONFIG[speed].label} · ${order === 'fixed' ? '固定顺序' : '随机顺序'}`,
        avgOffsetMs: Math.round(avgOffsetMs),
        rhythmIndex,
        accuracyPct,
      },
    };
    onFinish(record);
  }, [intervalMs, onFinish, order, speed]);

  const scheduleNextBeat = useCallback(() => {
    if (finishedRef.current) return;
    const idx = beatIndexRef.current;

    if (idx > 0 && !beatResolvedRef.current) {
      // Previous beat timed out without being tapped
      missRef.current += 1;
      setMisses(missRef.current);
    }

    if (idx >= TOTAL_BEATS) {
      finalizeTest();
      return;
    }

    const pad = sequenceRef.current[idx];
    beatResolvedRef.current = false;
    beatStartTimeRef.current = performance.now();
    setCurrentBeat(idx + 1);
    setActivePad(pad);

    beatIndexRef.current += 1;
    timerRef.current = window.setTimeout(() => {
      scheduleNextBeat();
    }, intervalMs);
  }, [finalizeTest, intervalMs]);

  const handleCountdownDone = useCallback(() => {
    finishedRef.current = false;
    sequenceRef.current = generateSequence();
    beatIndexRef.current = 0;
    validRef.current = 0;
    missRef.current = 0;
    totalClicksRef.current = 0;
    offsetsRef.current = [];
    setValidHits(0);
    setMisses(0);
    setCurrentBeat(0);
    startTimeRef.current = performance.now();
    setPhase('running');
    scheduleNextBeat();
  }, [generateSequence, scheduleNextBeat]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const flashPad = (index: number, type: 'hit' | 'miss') => {
    setPadFeedback({ index, type });
    setTimeout(() => {
      setPadFeedback((prev) => (prev && prev.index === index ? null : prev));
    }, 160);
  };

  const handlePadPress = (padIndex: number) => {
    if (phase !== 'running' || finishedRef.current) return;
    totalClicksRef.current += 1;

    if (activePad === padIndex && !beatResolvedRef.current) {
      const now = performance.now();
      const offset = Math.max(0, now - beatStartTimeRef.current);
      // 超过当前节拍间隔仍未点中视为迟到失误：避免下一节拍定时器因事件循环延迟
      // 尚未触发时，把一个本应超时的迟按误判为有效并记入异常时差。
      if (offset > intervalMs) {
        missRef.current += 1;
        setMisses(missRef.current);
        triggerMissFeedback(settings);
        flashPad(padIndex, 'miss');
        return;
      }
      beatResolvedRef.current = true;
      validRef.current += 1;
      offsetsRef.current.push(offset);
      setValidHits(validRef.current);
      setActivePad(null);
      triggerHitFeedback(settings, padIndex * 60);
      flashPad(padIndex, 'hit');
    } else {
      missRef.current += 1;
      setMisses(missRef.current);
      triggerMissFeedback(settings);
      flashPad(padIndex, 'miss');
    }
  };

  if (phase === 'setup') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-6">
        <div className="rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">节奏跟测</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                在 20 拍序列中跟随光点亮起节拍点击，测量同步精度与平均时差
              </p>
            </div>
            <button
              type="button"
              onClick={onExit}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              返回
            </button>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                节拍速度
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(SPEED_CONFIG) as SpeedPreset[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSpeed(key)}
                    className={`min-h-[44px] px-3 rounded-xl border text-xs sm:text-sm font-medium transition-colors ${
                      speed === key
                        ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {SPEED_CONFIG[key].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                光点顺序
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#090E16]">
                <button
                  type="button"
                  onClick={() => setOrder('fixed')}
                  className={`min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                    order === 'fixed'
                      ? 'bg-white dark:bg-[#172131] text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  固定顺序 (1→2→3→4)
                </button>
                <button
                  type="button"
                  onClick={() => setOrder('random')}
                  className={`min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                    order === 'random'
                      ? 'bg-white dark:bg-[#172131] text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  随机序列
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPhase('countdown')}
              className="w-full min-h-[48px] rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 text-white text-sm font-semibold transition-colors"
            >
              开始测试
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-3 flex flex-col h-[calc(100dvh-1.5rem)] max-h-[800px]">
      {phase === 'countdown' && (
        <CountdownOverlay
          settings={settings}
          modeName="节奏跟测"
          onComplete={handleCountdownDone}
          onExit={onExit}
        />
      )}

      {/* Telemetry Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 shrink-0">
        <div className="flex items-center gap-5">
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">节拍进度</span>
            <span className="font-mono-num text-lg font-semibold text-slate-900 dark:text-white">
              {currentBeat}/{TOTAL_BEATS}
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">准确</span>
            <span className="font-mono-num text-lg font-semibold text-cyan-600 dark:text-cyan-400">
              {validHits}
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">失误</span>
            <span className="font-mono-num text-lg font-semibold text-rose-500">
              {misses}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1621] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
        >
          退出
        </button>
      </div>

      {/* 2x2 Sequence Pad Arena */}
      <div className="flex-1 flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-[#0B111A] border border-slate-200 dark:border-slate-800 p-6 touch-none select-none">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-[360px] aspect-square">
          {[0, 1, 2, 3].map((idx) => {
            const isLit = activePad === idx;
            const fb = padFeedback?.index === idx ? padFeedback.type : null;
            return (
              <button
                key={idx}
                type="button"
                onPointerDown={() => handlePadPress(idx)}
                className={`relative flex flex-col items-center justify-center border-2 transition-all duration-75 active:scale-95 ${
                  settings.dotShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                } ${
                  isLit
                    ? 'bg-cyan-500 dark:bg-cyan-400 border-cyan-300 text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.45)]'
                    : fb === 'miss'
                    ? 'bg-rose-500/15 border-rose-500 text-rose-500'
                    : fb === 'hit'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-500'
                    : 'bg-slate-50 dark:bg-[#111927] border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                <span className="font-mono-num text-2xl font-bold">{idx + 1}</span>
                {isLit && (
                  <span className="text-[11px] font-medium mt-1">点击</span>
                )}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
          {SPEED_CONFIG[speed].label} · {order === 'fixed' ? '固定顺序' : '随机序列'}
        </p>
      </div>
    </div>
  );
};
