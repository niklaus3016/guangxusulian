import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppSettings, TestRecord } from '../../types';
import { triggerHitFeedback, triggerMissFeedback } from '../../utils/feedback';
import { CountdownOverlay } from '../CountdownOverlay';

interface MultiMatrixTestProps {
  settings: AppSettings;
  onFinish: (record: TestRecord) => void;
  onExit: () => void;
}

export const MultiMatrixTest: React.FC<MultiMatrixTestProps> = ({
  settings,
  onFinish,
  onExit,
}) => {
  const [gridSize, setGridSize] = useState<3 | 4>(3);
  const [durationSec, setDurationSec] = useState<15 | 30 | 60>(30);
  const [phase, setPhase] = useState<'setup' | 'countdown' | 'running'>('setup');

  const [activeCells, setActiveCells] = useState<number[]>([]);
  const [missFlashCell, setMissFlashCell] = useState<number | null>(null);
  const [validCount, setValidCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const activeCellsRef = useRef<number[]>([]);
  const validRef = useRef(0);
  const totalRef = useRef(0);
  const missRef = useRef(0);
  const startTimeRef = useRef(0);
  const finishedRef = useRef(false);

  const totalCells = gridSize * gridSize;
  const targetSimultaneous = 2;

  const pickRandomCell = useCallback(
    (exclude: number[]): number => {
      const candidates: number[] = [];
      for (let i = 0; i < totalCells; i++) {
        if (!exclude.includes(i)) candidates.push(i);
      }
      if (candidates.length === 0) return 0;
      return candidates[Math.floor(Math.random() * candidates.length)];
    },
    [totalCells],
  );

  const finalizeTest = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const valid = validRef.current;
    const total = totalRef.current;
    const miss = missRef.current;
    const cps = valid / durationSec;
    const accuracyPct = total > 0 ? Math.round((valid / total) * 1000) / 10 : 100;
    const score = Math.round(cps * 100 * (accuracyPct / 100));

    const record: TestRecord = {
      id: `matrix_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      modeType: 'multi_matrix',
      createTime: Date.now(),
      score,
      cps: Number(cps.toFixed(2)),
      reactionMs: null,
      totalClick: total,
      validClick: valid,
      miss,
      costTime: durationSec,
      details: {
        configLabel: `${gridSize}×${gridSize} 矩阵 · ${durationSec}s`,
        matrixSize: `${gridSize}×${gridSize}`,
        accuracyPct,
      },
    };
    onFinish(record);
  }, [durationSec, gridSize, onFinish]);

  const handleCountdownDone = useCallback(() => {
    finishedRef.current = false;
    validRef.current = 0;
    totalRef.current = 0;
    missRef.current = 0;

    const initial: number[] = [];
    for (let i = 0; i < targetSimultaneous; i++) {
      initial.push(pickRandomCell(initial));
    }
    activeCellsRef.current = initial;
    setActiveCells(initial);
    setValidCount(0);
    setMissCount(0);
    setElapsedMs(0);
    startTimeRef.current = performance.now();
    setPhase('running');
  }, [pickRandomCell]);

  useEffect(() => {
    if (phase !== 'running') return;
    let rafId = 0;
    let lastRender = 0;

    const tick = () => {
      if (finishedRef.current) return;
      const now = performance.now();
      const elapsed = now - startTimeRef.current;
      if (elapsed >= durationSec * 1000) {
        finalizeTest();
        return;
      }
      // 剩余时间显示只需 0.1s 精度，节流到 ~100ms，避免每帧全量重渲染
      if (now - lastRender >= 100) {
        lastRender = now;
        setElapsedMs(elapsed);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [durationSec, finalizeTest, phase]);

  const handleCellPointerDown = (cellIndex: number) => {
    if (phase !== 'running' || finishedRef.current) return;
    totalRef.current += 1;

    if (activeCellsRef.current.includes(cellIndex)) {
      validRef.current += 1;
      setValidCount(validRef.current);
      triggerHitFeedback(settings, (cellIndex % gridSize) * 40);

      const nextReplacement = pickRandomCell(activeCellsRef.current);
      const updated = activeCellsRef.current.map((c) => (c === cellIndex ? nextReplacement : c));
      activeCellsRef.current = updated;
      setActiveCells(updated);
    } else {
      missRef.current += 1;
      setMissCount(missRef.current);
      triggerMissFeedback(settings);
      setMissFlashCell(cellIndex);
      setTimeout(() => {
        setMissFlashCell((prev) => (prev === cellIndex ? null : prev));
      }, 160);
    }
  };

  if (phase === 'setup') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-6">
        <div className="rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">多指矩阵测试</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                在矩阵方格中快速响应双高亮目标，适合多指交替点击操作训练
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
                矩阵规格
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#090E16]">
                <button
                  type="button"
                  onClick={() => setGridSize(3)}
                  className={`min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                    gridSize === 3
                      ? 'bg-white dark:bg-[#172131] text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  3×3 矩阵
                </button>
                <button
                  type="button"
                  onClick={() => setGridSize(4)}
                  className={`min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                    gridSize === 4
                      ? 'bg-white dark:bg-[#172131] text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  4×4 矩阵
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                测试时长
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([15, 30, 60] as const).map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setDurationSec(sec)}
                    className={`min-h-[44px] rounded-xl border text-sm font-mono-num font-medium transition-colors ${
                      durationSec === sec
                        ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
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

  const remainingSec = Math.max(0, durationSec - elapsedMs / 1000);
  const liveCps = elapsedMs > 200 ? validCount / (elapsedMs / 1000) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-3 flex flex-col h-[calc(100dvh-1.5rem)] max-h-[800px]">
      {phase === 'countdown' && (
        <CountdownOverlay
          settings={settings}
          modeName="多指矩阵测试"
          onComplete={handleCountdownDone}
          onExit={onExit}
        />
      )}

      {/* Telemetry Top Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 shrink-0">
        <div className="flex items-center gap-5">
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">剩余时间</span>
            <span className="font-mono-num text-lg font-semibold text-slate-900 dark:text-white">
              {remainingSec.toFixed(1)}s
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">实时频率</span>
            <span className="font-mono-num text-lg font-semibold text-cyan-600 dark:text-cyan-400">
              {liveCps.toFixed(2)} <span className="text-xs font-normal">CPS</span>
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">失误</span>
            <span className="font-mono-num text-lg font-semibold text-rose-500">
              {missCount}
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

      {/* Matrix Arena */}
      <div className="flex-1 flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-[#0B111A] border border-slate-200 dark:border-slate-800 p-4 sm:p-6 touch-none select-none">
        <div
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
          className="grid gap-2.5 sm:gap-3.5 w-full max-w-[380px] aspect-square"
        >
          {Array.from({ length: totalCells }).map((_, idx) => {
            const isLit = activeCells.includes(idx);
            const isMiss = missFlashCell === idx;

            return (
              <button
                key={idx}
                type="button"
                onPointerDown={() => handleCellPointerDown(idx)}
                aria-label={`矩阵格 ${idx + 1}`}
                className={`flex items-center justify-center border transition-all duration-75 active:scale-95 ${
                  settings.dotShape === 'circle' ? 'rounded-2xl' : 'rounded-xl'
                } ${
                  isLit
                    ? 'bg-cyan-500 dark:bg-cyan-400 border-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.4)]'
                    : isMiss
                    ? 'bg-rose-500/20 border-rose-500'
                    : 'bg-slate-50 dark:bg-[#111927] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {isLit && (
                  <span
                    className={`w-1/3 h-1/3 bg-white/90 ${
                      settings.dotShape === 'circle' ? 'rounded-full' : 'rounded-sm'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
          支持多指同时点击高亮方格 · {gridSize}×{gridSize}
        </p>
      </div>
    </div>
  );
};
