import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppSettings, TestRecord } from '../../types';
import { getDotDimensions, triggerHitFeedback, triggerMissFeedback } from '../../utils/feedback';
import { CountdownOverlay } from '../CountdownOverlay';

interface ReactionTimeTestProps {
  settings: AppSettings;
  onFinish: (record: TestRecord) => void;
  onExit: () => void;
}

const TOTAL_ROUNDS = 5;

export const ReactionTimeTest: React.FC<ReactionTimeTestProps> = ({
  settings,
  onFinish,
  onExit,
}) => {
  const [phase, setPhase] = useState<'setup' | 'countdown' | 'running'>('setup');
  const [stage, setStage] = useState<'waiting' | 'lit' | 'round_result' | 'early_error'>('waiting');
  const [round, setRound] = useState(1);
  const [roundTimes, setRoundTimes] = useState<number[]>([]);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const [earlyMisses, setEarlyMisses] = useState(0);

  const litTimestampRef = useRef(0);
  const waitTimerRef = useRef<number | null>(null);
  const nextRoundTimerRef = useRef<number | null>(null);
  const roundTimesRef = useRef<number[]>([]);
  const earlyMissRef = useRef(0);
  const startTimeRef = useRef(0);
  const finishedRef = useRef(false);

  const dotSizePx = getDotDimensions(settings.dotSize);

  const clearTimers = () => {
    if (waitTimerRef.current) {
      clearTimeout(waitTimerRef.current);
      waitTimerRef.current = null;
    }
    if (nextRoundTimerRef.current) {
      clearTimeout(nextRoundTimerRef.current);
      nextRoundTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const startWaitingRound = useCallback(() => {
    clearTimers();
    setStage('waiting');
    const delayMs = 1000 + Math.random() * 4000; // 1~5s random wait
    waitTimerRef.current = window.setTimeout(() => {
      litTimestampRef.current = performance.now();
      setStage('lit');
    }, delayMs);
  }, []);

  const handleCountdownDone = useCallback(() => {
    finishedRef.current = false;
    roundTimesRef.current = [];
    earlyMissRef.current = 0;
    setRound(1);
    setRoundTimes([]);
    setEarlyMisses(0);
    setLastMs(null);
    startTimeRef.current = performance.now();
    setPhase('running');
    startWaitingRound();
  }, [startWaitingRound]);

  const finishAllRounds = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearTimers();

    const times = roundTimesRef.current;
    const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
    const fastestMs = Math.min(...times);
    const slowestMs = Math.max(...times);
    const costTime = (performance.now() - startTimeRef.current) / 1000;
    const score = Math.max(0, Math.round(1000 - avgMs));

    const record: TestRecord = {
      id: `react_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      modeType: 'reaction_time',
      createTime: Date.now(),
      score,
      cps: 0,
      reactionMs: Math.round(avgMs),
      totalClick: times.length + earlyMissRef.current,
      validClick: times.length,
      miss: earlyMissRef.current,
      costTime: Number(costTime.toFixed(2)),
      details: {
        configLabel: '连续 5 轮测量',
        roundTimesMs: times.map((t) => Math.round(t)),
        fastestMs: Math.round(fastestMs),
        slowestMs: Math.round(slowestMs),
        accuracyPct:
          times.length + earlyMissRef.current > 0
            ? Math.round((times.length / (times.length + earlyMissRef.current)) * 1000) / 10
            : 100,
        milestoneNote: avgMs < 200 ? '已达成参考训练目标（平均反应时延 < 200ms）' : undefined,
      },
    };
    onFinish(record);
  }, [onFinish]);

  const handleArenaPointerDown = () => {
    if (phase !== 'running' || finishedRef.current) return;

    if (stage === 'waiting') {
      // Early tap invalidation
      clearTimers();
      earlyMissRef.current += 1;
      setEarlyMisses(earlyMissRef.current);
      triggerMissFeedback(settings);
      setStage('early_error');
      nextRoundTimerRef.current = window.setTimeout(() => {
        startWaitingRound();
      }, 1100);
      return;
    }

    if (stage === 'lit') {
      const rt = Math.max(50, performance.now() - litTimestampRef.current);
      triggerHitFeedback(settings);
      roundTimesRef.current = [...roundTimesRef.current, rt];
      setRoundTimes(roundTimesRef.current);
      setLastMs(Math.round(rt));
      setStage('round_result');

      const completed = roundTimesRef.current.length;
      if (completed >= TOTAL_ROUNDS) {
        nextRoundTimerRef.current = window.setTimeout(() => {
          finishAllRounds();
        }, 700);
      } else {
        nextRoundTimerRef.current = window.setTimeout(() => {
          setRound(completed + 1);
          startWaitingRound();
        }, 900);
      }
    }
  };

  if (phase === 'setup') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-6">
        <div className="rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">反应测速</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                以毫秒精度测量视觉感知到手指触发的反应时延
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

          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B1018] space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <p className="font-medium text-slate-800 dark:text-slate-200">测试规则说明</p>
              <p>1. 每次测试连续进行 {TOTAL_ROUNDS} 轮有效采集，计算平均反应时延。</p>
              <p>2. 每轮将随机等待 1～5 秒，光点突然亮起时请立即点击屏幕。</p>
              <p>3. 光点亮起前提前点击判定无效，该轮将自动重置等待时间。</p>
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
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 py-3 flex flex-col h-[calc(100dvh-1.5rem)] max-h-[800px]">
      {phase === 'countdown' && (
        <CountdownOverlay
          settings={settings}
          modeName="反应测速"
          onComplete={handleCountdownDone}
          onExit={onExit}
        />
      )}

      {/* Telemetry Top Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 shrink-0">
        <div className="flex items-center gap-5">
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">当前轮次</span>
            <span className="font-mono-num text-lg font-semibold text-slate-900 dark:text-white">
              {round}/{TOTAL_ROUNDS}
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">上轮耗时</span>
            <span className="font-mono-num text-lg font-semibold text-cyan-600 dark:text-cyan-400">
              {lastMs !== null ? `${lastMs} ms` : '--'}
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">提前无效</span>
            <span className="font-mono-num text-lg font-semibold text-slate-700 dark:text-slate-300">
              {earlyMisses}
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

      {/* Reaction Blank Arena */}
      <div
        onPointerDown={handleArenaPointerDown}
        className={`relative flex-1 w-full rounded-2xl border flex flex-col items-center justify-center touch-none select-none transition-colors duration-75 ${
          stage === 'lit'
            ? 'bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/60 cursor-pointer'
            : stage === 'early_error'
            ? 'bg-rose-500/10 border-rose-500/50'
            : 'bg-white dark:bg-[#0B111A] border-slate-200 dark:border-slate-800'
        }`}
      >
        {stage === 'waiting' && (
          <div className="text-center px-6">
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 mx-auto mb-4" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              保持注视，等待光点亮起…
            </p>
          </div>
        )}

        {stage === 'lit' && (
          <div className="flex flex-col items-center">
            <div
              style={{ width: dotSizePx * 1.4, height: dotSizePx * 1.4 }}
              className={`bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.65)] flex items-center justify-center ${
                settings.dotShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
              }`}
            >
              <span
                className={`w-1/3 h-1/3 bg-white ${
                  settings.dotShape === 'circle' ? 'rounded-full' : 'rounded-sm'
                }`}
              />
            </div>
            <p className="mt-5 text-sm font-semibold text-cyan-600 dark:text-cyan-400">
              立即点击
            </p>
          </div>
        )}

        {stage === 'early_error' && (
          <div className="text-center px-6">
            <p className="text-base font-semibold text-rose-600 dark:text-rose-400">
              光点尚未亮起，提前点击无效
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              即将重新开始第 {round} 轮等待
            </p>
          </div>
        )}

        {stage === 'round_result' && (
          <div className="text-center px-6">
            <p className="text-xs text-slate-500 dark:text-slate-400">第 {roundTimes.length} 轮反应时间</p>
            <p className="mt-1 font-mono-num text-4xl font-bold text-slate-900 dark:text-white">
              {lastMs} <span className="text-lg font-medium text-cyan-600 dark:text-cyan-400">ms</span>
            </p>
          </div>
        )}

        {/* Mini Round Progress Strip at bottom of arena */}
        <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
            const val = roundTimes[i];
            return (
              <div
                key={i}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-num border ${
                  val !== undefined
                    ? 'border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300'
                    : i === round - 1
                    ? 'border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                }`}
              >
                {val !== undefined ? `${Math.round(val)}ms` : `#${i + 1}`}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
