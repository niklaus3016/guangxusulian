import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, RotateCcw, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { MODE_META_MAP, TestRecord } from '../types';
import { formatRecordPrimaryValue, formatTimestamp } from '../utils/storage';

interface TestReportProps {
  record: TestRecord | null;
  abortedReason?: string | null;
  abortedModeName?: string;
  isNewBest: boolean;
  previousBestValue?: string | null;
  onRetry: () => void;
  onHome: () => void;
}

export const TestReport: React.FC<TestReportProps> = ({
  record,
  abortedReason,
  abortedModeName,
  isNewBest,
  previousBestValue,
  onRetry,
  onHome,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Aborted test view (e.g., 连贯滑动测试中途抬起或顺序错误)
  if (!record && abortedReason) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            {abortedModeName || '测试'} · 本次测试已中止
          </p>
          <h2 className="mt-1.5 text-xl font-semibold text-slate-900 dark:text-slate-100">
            {abortedReason}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            未完成完整测试流程，本次数据未计入历史记录与个人最佳。
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onHome}
              className="min-h-[48px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="min-h-[48px] px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              再次测试
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!record) return null;

  const meta = MODE_META_MAP[record.modeType];
  const primary = formatRecordPrimaryValue(record);
  const accuracy =
    record.details?.accuracyPct !== undefined
      ? record.details.accuracyPct
      : record.totalClick > 0
      ? Math.round((record.validClick / record.totalClick) * 1000) / 10
      : 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <div className="rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        {/* Header Metadata (Zero-Pill Clean Text) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-200">{meta.name}</span>
            <span aria-hidden="true">·</span>
            <span>{record.details?.configLabel || '标准测试组'}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num">{formatTimestamp(record.createTime)}</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">测试报告页</span>
        </div>

        {/* Primary Metric Display */}
        <div className="py-7 text-center">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide">
            {meta.metricLabel}
          </p>
          <div className="mt-2 flex items-baseline justify-center gap-2">
            <span className="font-mono-num text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
              {primary.value}
            </span>
            {primary.unit && (
              <span className="text-lg font-medium text-cyan-600 dark:text-cyan-400">
                {primary.unit}
              </span>
            )}
          </div>

          {/* Personal Best Notification (Minimalist tech style, zero trophies/confetti) */}
          {isNewBest && (
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 text-xs font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>新的个人最佳</span>
              {previousBestValue && (
                <span className="text-slate-500 dark:text-slate-400 font-mono-num">
                  （此前：{previousBestValue}）
                </span>
              )}
            </div>
          )}

          {/* Optional factual threshold note */}
          {record.details?.milestoneNote && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{record.details.milestoneNote}</span>
            </div>
          )}
        </div>

        {/* Auxiliary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          {record.modeType === 'reaction_time' ? (
            <>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1018]">
                <p className="text-xs text-slate-500 dark:text-slate-400">最快单轮</p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {record.details?.fastestMs ? `${Math.round(record.details.fastestMs)} ms` : '--'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1018]">
                <p className="text-xs text-slate-500 dark:text-slate-400">最慢单轮</p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {record.details?.slowestMs ? `${Math.round(record.details.slowestMs)} ms` : '--'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1018]">
                <p className="text-xs text-slate-500 dark:text-slate-400">有效轮次</p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {record.validClick} 轮
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1018]">
                <p className="text-xs text-slate-500 dark:text-slate-400">提前误触</p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {record.miss} 次
                </p>
              </div>
            </>
          ) : record.modeType === 'rhythm_follow' ? (
            <>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1018]">
                <p className="text-xs text-slate-500 dark:text-slate-400">准确命中</p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {record.validClick} 次
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1018]">
                <p className="text-xs text-slate-500 dark:text-slate-400">失误次数</p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {record.miss} 次
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1018]">
                <p className="text-xs text-slate-500 dark:text-slate-400">平均时差</p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {record.details?.avgOffsetMs !== undefined ? `${Math.round(record.details.avgOffsetMs)} ms` : '--'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1018]">
                <p className="text-xs text-slate-500 dark:text-slate-400">准确率</p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {accuracy}%
                </p>
              </div>
            </>
          ) : record.modeType === 'continuous_slide' ? (
            <>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1018]">
                <p className="text-xs text-slate-500 dark:text-slate-400">光点数量</p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {record.validClick} 个
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1018]">
                <p className="text-xs text-slate-500 dark:text-slate-400">平均每点耗时</p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {record.validClick > 0 ? `${Math.round((record.costTime * 1000) / record.validClick)} ms` : '--'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1018]">
                <p className="text-xs text-slate-500 dark:text-slate-400">漏点数</p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {record.details?.missedNodes ?? 0} 个
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1018]">
                <p className="text-xs text-slate-500 dark:text-slate-400">顺序错误</p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {record.details?.orderErrors ?? 0} 次
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1018]">
                <p className="text-xs text-slate-500 dark:text-slate-400">有效点击</p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {record.validClick} 次
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1018]">
                <p className="text-xs text-slate-500 dark:text-slate-400">总点击数</p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {record.totalClick} 次
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1018]">
                <p className="text-xs text-slate-500 dark:text-slate-400">准确率</p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {accuracy}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1018]">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {record.details?.peakCps !== undefined ? '最高瞬时 CPS' : '失误次数'}
                </p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {record.details?.peakCps !== undefined
                    ? record.details.peakCps.toFixed(1)
                    : `${record.miss} 次`}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Expandable Details Section (查看本次详情) */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>记录编号</span>
              <span className="font-mono-num">{record.id}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>测试总耗时</span>
              <span className="font-mono-num">{record.costTime.toFixed(2)} s</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>综合指数</span>
              <span className="font-mono-num">{Math.round(record.score)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>失误统计</span>
              <span className="font-mono-num">{record.miss} 次</span>
            </div>

            {record.details?.roundTimesMs && record.details.roundTimesMs.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">各轮反应耗时明细</p>
                <div className="grid grid-cols-5 gap-2">
                  {record.details.roundTimesMs.map((ms, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-[#0B1018] text-center"
                    >
                      <div className="text-[11px] text-slate-400">第{idx + 1}轮</div>
                      <div className="font-mono-num text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {Math.round(ms)}ms
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            再次测试
          </button>
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="min-h-[48px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>查看本次详情</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onHome}
            className="min-h-[48px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
};
