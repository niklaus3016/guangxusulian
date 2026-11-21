import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppSettings, TestRecord } from '../../types';
import { getDotDimensions, triggerHitFeedback, triggerMissFeedback } from '../../utils/feedback';
import { CountdownOverlay } from '../CountdownOverlay';

interface ContinuousSlideTestProps {
  settings: AppSettings;
  onFinish: (record: TestRecord) => void;
  onAbort: (reason: string) => void;
  onExit: () => void;
}

interface SlideNode {
  index: number; // 1..N
  xPct: number;
  yPct: number;
}

export const ContinuousSlideTest: React.FC<ContinuousSlideTestProps> = ({
  settings,
  onFinish,
  onAbort,
  onExit,
}) => {
  const [nodeCount, setNodeCount] = useState<6 | 12 | 20>(6);
  const [phase, setPhase] = useState<'setup' | 'countdown' | 'running'>('setup');

  const [nodes, setNodes] = useState<SlideNode[]>([]);
  const [visitedCount, setVisitedCount] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [pointerPct, setPointerPct] = useState<{ x: number; y: number } | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [hintText, setHintText] = useState('按住编号 1 的光点，不抬起手指依次滑过全部光点');

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const startTimeRef = useRef(0);
  const visitedRef = useRef(0);
  const isSlidingRef = useRef(false);
  const finishedRef = useRef(false);
  const nodesRef = useRef<SlideNode[]>([]);
  const lastPointerRenderRef = useRef(0);

  const baseDotPx = getDotDimensions(settings.dotSize);
  const nodeSizePx = nodeCount === 20 ? Math.min(baseDotPx, 46) : Math.min(baseDotPx, 54);

  const generateNodes = useCallback((count: number): SlideNode[] => {
    const generated: SlideNode[] = [];
    // Use stratified grid jitter to guarantee non-overlapping clean distribution across any mobile/desktop viewport
    const cols = count === 6 ? 3 : count === 12 ? 4 : 5;
    const rows = Math.ceil(count / cols);

    const cells: { r: number; c: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({ r, c });
      }
    }
    // Shuffle cells
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    const padX = 11;
    const padY = 12;
    const usableW = 100 - padX * 2;
    const usableH = 100 - padY * 2;
    const cellW = usableW / cols;
    const cellH = usableH / rows;

    for (let i = 0; i < count; i++) {
      const { r, c } = cells[i];
      const jitterX = 0.25 + Math.random() * 0.5;
      const jitterY = 0.25 + Math.random() * 0.5;
      generated.push({
        index: i + 1,
        xPct: padX + (c + jitterX) * cellW,
        yPct: padY + (r + jitterY) * cellH,
      });
    }
    return generated;
  }, []);

  const handleCountdownDone = useCallback(() => {
    finishedRef.current = false;
    visitedRef.current = 0;
    isSlidingRef.current = false;
    const newNodes = generateNodes(nodeCount);
    nodesRef.current = newNodes;
    setNodes(newNodes);
    setVisitedCount(0);
    setIsSliding(false);
    setPointerPct(null);
    setElapsedMs(0);
    setHintText('按住编号 1 的光点，不抬起手指依次滑过全部光点');
    setPhase('running');
  }, [generateNodes, nodeCount]);

  useEffect(() => {
    if (phase !== 'running' || !isSliding) return;
    let rafId = 0;
    let lastRender = 0;
    const tick = () => {
      if (finishedRef.current) return;
      const now = performance.now();
      if (now - lastRender >= 100) {
        lastRender = now;
        setElapsedMs(now - startTimeRef.current);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isSliding, phase]);

  const completeTest = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    isSlidingRef.current = false;
    const costTime = Math.max(0.05, (performance.now() - startTimeRef.current) / 1000);
    const cps = nodeCount / costTime;
    const score = Math.round((nodeCount / costTime) * 100);

    const record: TestRecord = {
      id: `slide_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      modeType: 'continuous_slide',
      createTime: Date.now(),
      score,
      cps: Number(cps.toFixed(2)),
      reactionMs: null,
      totalClick: nodeCount,
      validClick: nodeCount,
      miss: 0,
      costTime: Number(costTime.toFixed(2)),
      details: {
        configLabel: `${nodeCount} 个光点`,
        nodeCount,
        missedNodes: 0,
        orderErrors: 0,
        accuracyPct: 100,
      },
    };
    onFinish(record);
  }, [nodeCount, onFinish]);

  const abortWithReason = useCallback(
    (reason: string) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      isSlidingRef.current = false;
      triggerMissFeedback(settings);
      onAbort(reason);
    },
    [onAbort, settings],
  );

  const checkNodeHit = (clientX: number, clientY: number) => {
    const arena = arenaRef.current;
    if (!arena) return null;
    const rect = arena.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    // 命中检测必须每次 move 都跑（≤20 个节点，开销极小），
    // 但实时轨迹线的 setState 合帧到 ~60fps，避免 120Hz 设备上每帧多次重渲染。
    const now = performance.now();
    if (now - lastPointerRenderRef.current >= 16) {
      lastPointerRenderRef.current = now;
      setPointerPct({
        x: Math.max(0, Math.min(100, (px / rect.width) * 100)),
        y: Math.max(0, Math.min(100, (py / rect.height) * 100)),
      });
    }

    const hitRadius = nodeSizePx * 0.62;
    for (const node of nodesRef.current) {
      const nx = (node.xPct / 100) * rect.width;
      const ny = (node.yPct / 100) * rect.height;
      if (Math.hypot(px - nx, py - ny) <= hitRadius) {
        return node;
      }
    }
    return null;
  };

  const handleArenaPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'running' || finishedRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    const hitNode = checkNodeHit(e.clientX, e.clientY);
    if (!hitNode) {
      setHintText('请直接按住编号 1 的光点开始滑动');
      return;
    }

    if (hitNode.index !== 1) {
      setHintText('必须从编号 1 的光点开始');
      triggerMissFeedback(settings);
      return;
    }

    // Start continuous slide
    startTimeRef.current = performance.now();
    isSlidingRef.current = true;
    visitedRef.current = 1;
    setIsSliding(true);
    setVisitedCount(1);
    setHintText(`继续滑向编号 2（剩余 ${nodeCount - 1} 个）`);
    triggerHitFeedback(settings, 20);
  };

  const handleArenaPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'running' || !isSlidingRef.current || finishedRef.current) return;

    const hitNode = checkNodeHit(e.clientX, e.clientY);
    if (!hitNode) return;

    const expected = visitedRef.current + 1;
    if (hitNode.index <= visitedRef.current) {
      // Already visited, ignore
      return;
    }

    if (hitNode.index === expected) {
      visitedRef.current = expected;
      setVisitedCount(expected);
      triggerHitFeedback(settings, Math.min(400, expected * 25));

      if (expected >= nodeCount) {
        completeTest();
      } else {
        setHintText(`继续滑向编号 ${expected + 1}`);
      }
    } else if (hitNode.index > expected) {
      // Skipped expected node / wrong order
      abortWithReason(`滑错顺序（跳过编号 ${expected} 触及编号 ${hitNode.index}），测试已中止`);
    }
  };

  const handleArenaPointerUpOrCancel = () => {
    if (phase !== 'running' || !isSlidingRef.current || finishedRef.current) return;
    if (visitedRef.current < nodeCount) {
      abortWithReason('手指中途抬起，连续滑动中断');
    }
  };

  if (phase === 'setup') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-6">
        <div className="rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">连贯滑动测试</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                按顺序不间断滑过所有编号光点，测量连续轨迹操控流畅度
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
                光点数量
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([6, 12, 20] as const).map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setNodeCount(cnt)}
                    className={`min-h-[44px] rounded-xl border text-sm font-mono-num font-medium transition-colors ${
                      nodeCount === cnt
                        ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {cnt} 个
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B1018] space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <p className="font-medium text-slate-800 dark:text-slate-200">测试规范</p>
              <p>从编号 1 按住不放，依次连续滑过所有光点直至最后一个编号。</p>
              <p>中途抬起手指、漏点或滑错序号将直接中止本次测试。</p>
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

  const visitedNodes = nodes.slice(0, visitedCount);

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 py-3 flex flex-col h-[calc(100dvh-1.5rem)] max-h-[820px]">
      {phase === 'countdown' && (
        <CountdownOverlay
          settings={settings}
          modeName="连贯滑动测试"
          onComplete={handleCountdownDone}
          onExit={onExit}
        />
      )}

      {/* Telemetry Top Bar */}
      <div className="flex items-center justify-between gap-2 pb-2 shrink-0">
        <div className="flex items-center gap-5">
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">已通过光点</span>
            <span className="font-mono-num text-lg font-semibold text-slate-900 dark:text-white">
              {visitedCount}/{nodeCount}
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">计时</span>
            <span className="font-mono-num text-lg font-semibold text-cyan-600 dark:text-cyan-400">
              {(elapsedMs / 1000).toFixed(2)}s
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

      <p className="text-xs text-slate-500 dark:text-slate-400 pb-2 shrink-0">{hintText}</p>

      {/* Slide Arena */}
      <div
        ref={arenaRef}
        onPointerDown={handleArenaPointerDown}
        onPointerMove={handleArenaPointerMove}
        onPointerUp={handleArenaPointerUpOrCancel}
        onPointerCancel={handleArenaPointerUpOrCancel}
        className="relative flex-1 w-full rounded-2xl bg-white dark:bg-[#0B111A] border border-slate-200 dark:border-slate-800 overflow-hidden touch-none select-none cursor-crosshair"
      >
        {/* SVG Trajectory Lines */}
        <svg className="pointer-events-none absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Guide faint dotted preview between next two nodes */}
          {visitedCount < nodes.length && (
            <line
              x1={visitedCount > 0 ? nodes[visitedCount - 1].xPct : nodes[0].xPct}
              y1={visitedCount > 0 ? nodes[visitedCount - 1].yPct : nodes[0].yPct}
              x2={nodes[visitedCount].xPct}
              y2={nodes[visitedCount].yPct}
              stroke="currentColor"
              strokeWidth="0.4"
              strokeDasharray="1.5 1.5"
              className="text-cyan-500/35"
            />
          )}

          {/* Active completed polyline */}
          {visitedNodes.length > 1 && (
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-cyan-500 dark:text-cyan-400"
              points={visitedNodes.map((n) => `${n.xPct},${n.yPct}`).join(' ')}
            />
          )}

          {/* Live finger segment */}
          {isSliding && visitedNodes.length > 0 && pointerPct && (
            <line
              x1={visitedNodes[visitedNodes.length - 1].xPct}
              y1={visitedNodes[visitedNodes.length - 1].yPct}
              x2={pointerPct.x}
              y2={pointerPct.y}
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-cyan-400/70"
            />
          )}
        </svg>

        {/* Numbered Nodes */}
        {nodes.map((node) => {
          const isVisited = node.index <= visitedCount;
          const isNext = node.index === visitedCount + 1;

          return (
            <div
              key={node.index}
              style={{
                left: `${node.xPct}%`,
                top: `${node.yPct}%`,
                width: `${nodeSizePx}px`,
                height: `${nodeSizePx}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`pointer-events-none absolute flex items-center justify-center font-mono-num text-sm font-bold border-2 transition-colors duration-100 ${
                settings.dotShape === 'circle' ? 'rounded-full' : 'rounded-xl'
              } ${
                isVisited
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-300'
                  : isNext
                  ? 'bg-cyan-500 dark:bg-cyan-400 border-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.45)]'
                  : 'bg-slate-100 dark:bg-[#141E2C] border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {node.index}
            </div>
          );
        })}
      </div>
    </div>
  );
};
