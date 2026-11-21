import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppSettings, TestRecord } from '../../types';
import { getDotDimensions, triggerHitFeedback, triggerMissFeedback } from '../../utils/feedback';
import { CountdownOverlay } from '../CountdownOverlay';

interface TapSpeedTestProps {
  settings: AppSettings;
  onFinish: (record: TestRecord) => void;
  onExit: () => void;
}

type TapSubMode = 'time' | 'count';

interface Ripple {
  id: number;
  x: number;
  y: number;
  isMiss: boolean;
}

export const TapSpeedTest: React.FC<TapSpeedTestProps> = ({ settings, onFinish, onExit }) => {
  const [subMode, setSubMode] = useState<TapSubMode>('time');
  const [timeLimit, setTimeLimit] = useState<10 | 30 | 60>(10);
  const [countLimit, setCountLimit] = useState<50 | 100>(50);
  const [phase, setPhase] = useState<'setup' | 'countdown' | 'running'>('setup');

  const [dotPos, setDotPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 }); // percentage 12..88
  const [validCount, setValidCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const startTimeRef = useRef<number>(0);
  const hitTimesRef = useRef<number[]>([]);
  const validRef = useRef(0);
  const totalRef = useRef(0);
  const missRef = useRef(0);
  const finishedRef = useRef(false);
  const rippleIdRef = useRef(0);

  const dotSizePx = getDotDimensions(settings.dotSize);

  const spawnNextDot = useCallback((prevX: number, prevY: number) => {
    const arena = arenaRef.current;
    // Keep safe margin from edges in percentage based on arena dimensions
    let minPctX = 14;
    let maxPctX = 86;
    let minPctY = 14;
    let maxPctY = 86;

    if (arena) {
      const rect = arena.getBoundingClientRect();
      const padPx = dotSizePx / 2 + 18;
      if (rect.width > padPx * 2.5) {
        minPctX = (padPx / rect.width) * 100;
        maxPctX = 100 - minPctX;
      }
      if (rect.height > padPx * 2.5) {
        minPctY = (padPx / rect.height) * 100;
        maxPctY = 100 - minPctY;
      }
    }

    let nextX = prevX;
    let nextY = prevY;
    for (let attempt = 0; attempt < 8; attempt++) {
      const cx = minPctX + Math.random() * (maxPctX - minPctX);
      const cy = minPctY + Math.random() * (maxPctY - minPctY);
      const dist = Math.hypot(cx - prevX, cy - prevY);
      nextX = cx;
      nextY = cy;
      if (dist >= 16) break;
    }
    setDotPos({ x: nextX, y: nextY });
  }, [dotSizePx]);

  const computePeakCps = (timestamps: number[]): number => {
    if (timestamps.length === 0) return 0;
    let maxInWindow = 1;
    let left = 0;
    for (let right = 0; right < timestamps.length; right++) {
      while (timestamps[right] - timestamps[left] > 1000) {
        left++;
      }
      const count = right - left + 1;
      if (count > maxInWindow) maxInWindow = count;
    }
    return maxInWindow;
  };

  const finalizeTest = useCallback(
    (finalDurationSec: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;

      const valid = validRef.current;
      const total = totalRef.current;
      const miss = missRef.current;
      const safeDuration = Math.max(finalDurationSec, 0.1);
      const cps = valid / safeDuration;
      const peakCps = computePeakCps(hitTimesRef.current);
      const accuracyPct = total > 0 ? Math.round((valid / total) * 1000) / 10 : 100;
      const score = Math.round(cps * 100 * (accuracyPct / 100));

      const record: TestRecord = {
        id: `tap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        modeType: 'tap_speed',
        createTime: Date.now(),
        score,
        cps: Number(cps.toFixed(2)),
        reactionMs: null,
        totalClick: total,
        validClick: valid,
        miss,
        costTime: Number(safeDuration.toFixed(2)),
        details: {
          configLabel: subMode === 'time' ? `限时 ${timeLimit}s` : `限次 ${countLimit} 次`,
          peakCps,
          accuracyPct,
          milestoneNote: cps >= 6 ? '已达成参考训练目标（平均 CPS ≥ 6.0）' : undefined,
        },
      };
      onFinish(record);
    },
    [countLimit, onFinish, subMode, timeLimit],
  );

  const handleCountdownDone = useCallback(() => {
    finishedRef.current = false;
    validRef.current = 0;
    totalRef.current = 0;
    missRef.current = 0;
    hitTimesRef.current = [];
    setValidCount(0);
    setTotalCount(0);
    setMissCount(0);
    setElapsedMs(0);
    startTimeRef.current = performance.now();
    spawnNextDot(50, 50);
    setPhase('running');
  }, [spawnNextDot]);

  useEffect(() => {
    if (phase !== 'running') return;
    let rafId = 0;
    let lastRender = 0;

    const tick = () => {
      // 限次模式达成目标 / 任意模式结束后，停止循环，避免结束后仍每帧 setState
      if (finishedRef.current) return;
      const now = performance.now();
      const elapsed = now - startTimeRef.current;

      if (subMode === 'time' && elapsed >= timeLimit * 1000) {
        finalizeTest(timeLimit);
        return;
      }
      // 计时显示只需 0.1s 精度，节流到 ~100ms，避免每帧 60fps 带动整个 arena 重渲染
      if (now - lastRender >= 100) {
        lastRender = now;
        setElapsedMs(elapsed);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [finalizeTest, phase, subMode, timeLimit]);

  const addRipple = (clientX: number, clientY: number, isMiss: boolean) => {
    const arena = arenaRef.current;
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    const id = ++rippleIdRef.current;
    setRipples((prev) => [
      ...prev.slice(-6),
      {
        id,
        x: clientX - rect.left,
        y: clientY - rect.top,
        isMiss,
      },
    ]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 300);
  };

  const handleDotPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (phase !== 'running' || finishedRef.current) return;

    const now = performance.now();
    hitTimesRef.current.push(now);
    validRef.current += 1;
    totalRef.current += 1;
    setValidCount(validRef.current);
    setTotalCount(totalRef.current);

    triggerHitFeedback(settings);
    addRipple(e.clientX, e.clientY, false);

    if (subMode === 'count' && validRef.current >= countLimit) {
      finalizeTest((now - startTimeRef.current) / 1000);
      return;
    }

    spawnNextDot(dotPos.x, dotPos.y);
  };

  const handleArenaPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'running' || finishedRef.current) return;
    totalRef.current += 1;
    setTotalCount(totalRef.current);

    if (settings.tapMissPenalty) {
      missRef.current += 1;
      setMissCount(missRef.current);
      triggerMissFeedback(settings);
      addRipple(e.clientX, e.clientY, true);
    }
  };

  if (phase === 'setup') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-6">
        <div className="rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">点按测速</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                连续点击随机位置生成的光点，测量点击频率（CPS）与瞬时峰值
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
                测试方式
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#090E16]">
                <button
                  type="button"
                  onClick={() => setSubMode('time')}
                  className={`min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                    subMode === 'time'
                      ? 'bg-white dark:bg-[#172131] text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  限时测试
                </button>
                <button
                  type="button"
                  onClick={() => setSubMode('count')}
                  className={`min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                    subMode === 'count'
                      ? 'bg-white dark:bg-[#172131] text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  限数量测试
                </button>
              </div>
            </div>

            {subMode === 'time' ? (
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  测试时长
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([10, 30, 60] as const).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setTimeLimit(sec)}
                      className={`min-h-[44px] rounded-xl border text-sm font-mono-num font-medium transition-colors ${
                        timeLimit === sec
                          ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  目标点击次数
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {([50, 100] as const).map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setCountLimit(cnt)}
                      className={`min-h-[44px] rounded-xl border text-sm font-mono-num font-medium transition-colors ${
                        countLimit === cnt
                          ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {cnt} 次
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1018] flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>点空计失误规则</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {settings.tapMissPenalty ? '已开启（点空白计入失误）' : '已关闭（点空白不计失误）'}
              </span>
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

  const remainingSec = Math.max(0, timeLimit - elapsedMs / 1000);
  const currentCps = elapsedMs > 200 ? validCount / (elapsedMs / 1000) : 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 py-3 flex flex-col h-[calc(100dvh-1.5rem)] max-h-[820px]">
      {phase === 'countdown' && (
        <CountdownOverlay
          settings={settings}
          modeName="点按测速"
          onComplete={handleCountdownDone}
          onExit={onExit}
        />
      )}

      {/* Compact Active Telemetry Top Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 shrink-0">
        <div className="flex items-center gap-4 sm:gap-6">
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">
              {subMode === 'time' ? '剩余时间' : '已完成'}
            </span>
            <span className="font-mono-num text-lg font-semibold text-slate-900 dark:text-white">
              {subMode === 'time' ? `${remainingSec.toFixed(1)}s` : `${validCount}/${countLimit}`}
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">实时频率</span>
            <span className="font-mono-num text-lg font-semibold text-cyan-600 dark:text-cyan-400">
              {currentCps.toFixed(2)} <span className="text-xs font-normal">CPS</span>
            </span>
          </div>
          {settings.tapMissPenalty && (
            <div>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">失误</span>
              <span className="font-mono-num text-lg font-semibold text-rose-500">
                {missCount}
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onExit}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1621] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
        >
          退出
        </button>
      </div>

      {/* Testing Arena */}
      <div
        ref={arenaRef}
        onPointerDown={handleArenaPointerDown}
        className="relative flex-1 w-full rounded-2xl bg-white dark:bg-[#0B111A] border border-slate-200 dark:border-slate-800 overflow-hidden touch-none select-none cursor-crosshair"
      >
        {/* Subtle calibration crosshair lines */}
        <div className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Ripples */}
        {ripples.map((r) => (
          <span
            key={r.id}
            style={{ left: r.x, top: r.y, width: dotSizePx, height: dotSizePx }}
            className={`pointer-events-none absolute animate-ripple-fade border-2 ${
              settings.dotShape === 'circle' ? 'rounded-full' : 'rounded-xl'
            } ${r.isMiss ? 'border-rose-500/70' : 'border-cyan-400/70'}`}
          />
        ))}

        {/* Optical Target Dot */}
        {phase === 'running' && (
          <button
            type="button"
            onPointerDown={handleDotPointerDown}
            aria-label="目标光点"
            style={{
              left: `${dotPos.x}%`,
              top: `${dotPos.y}%`,
              width: `${dotSizePx}px`,
              height: `${dotSizePx}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className={`absolute flex items-center justify-center bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.45)] active:scale-90 transition-transform duration-75 ${
              settings.dotShape === 'circle' ? 'rounded-full' : 'rounded-xl'
            }`}
          >
            <span
              className={`w-1/3 h-1/3 bg-white/90 ${
                settings.dotShape === 'circle' ? 'rounded-full' : 'rounded-sm'
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
};
