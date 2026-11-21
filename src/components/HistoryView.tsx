import React, { useState } from 'react';
import { Trash2, Info } from 'lucide-react';
import { MODE_META_LIST, MODE_META_MAP, ModeType, PersonalBestMap, TestRecord } from '../types';
import { formatRecordPrimaryValue, formatTimestamp, getBestPrimaryLabel } from '../utils/storage';
import { ConfirmModal } from './ConfirmModal';

interface HistoryViewProps {
  records: TestRecord[];
  personalBests: PersonalBestMap;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  personalBests,
  onDeleteRecord,
  onClearAll,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | ModeType>('all');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const filteredRecords =
    filterMode === 'all' ? records : records.filter((r) => r.modeType === filterMode);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            历史测试记录
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            共保存 {records.length} 条本地训练记录 · 按时间倒序排列
          </p>
        </div>

        {records.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmClearAll(true)}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4" />
            清空全部历史
          </button>
        )}
      </div>

      {/* Personal Best Spotlight Panel */}
      <section className="mt-5">
        <h2 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
          各模式个人最佳统计
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {MODE_META_LIST.map((mode) => {
            const best = personalBests[mode.type];
            return (
              <div
                key={mode.type}
                className={`p-3.5 rounded-xl border ${
                  best
                    ? 'bg-white dark:bg-[#0F1621] border-cyan-500/35 dark:border-cyan-500/30'
                    : 'bg-slate-50/70 dark:bg-[#0B1018] border-slate-200 dark:border-slate-800/80'
                }`}
              >
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{mode.name}</p>
                <p
                  className={`mt-1.5 font-mono-num text-base font-semibold ${
                    best ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {getBestPrimaryLabel(mode.type, best)}
                </p>
                {best && (
                  <p className="mt-1 text-[11px] font-mono-num text-slate-400 dark:text-slate-500">
                    {formatTimestamp(best.createTime)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Mode Filter Tabs */}
      <section className="mt-6">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              filterMode === 'all'
                ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950'
                : 'bg-slate-100 dark:bg-[#0F1621] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            全部 ({records.length})
          </button>
          {MODE_META_LIST.map((m) => {
            const count = records.filter((r) => r.modeType === m.type).length;
            return (
              <button
                key={m.type}
                type="button"
                onClick={() => setFilterMode(m.type)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  filterMode === m.type
                    ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950'
                    : 'bg-slate-100 dark:bg-[#0F1621] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {m.name} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Records List */}
      <section className="mt-4">
        {filteredRecords.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 p-10 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              暂无符合条件的测试记录
            </p>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              完成任意模式的自测训练后，系统将自动在此留存记录
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
            {filteredRecords.map((rec) => {
              const meta = MODE_META_MAP[rec.modeType];
              const primary = formatRecordPrimaryValue(rec);
              const isBest = personalBests[rec.modeType]?.id === rec.id;

              return (
                <div
                  key={rec.id}
                  className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {meta.name}
                      </span>
                      {isBest && (
                        <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
                          · 个人最佳
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="font-mono-num">{formatTimestamp(rec.createTime)}</span>
                      {rec.details?.configLabel && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{rec.details.configLabel}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num">
                        有效 {rec.validClick} / 失误 {rec.miss}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-mono-num text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {primary.value}
                      </span>
                      {primary.unit && (
                        <span className="ml-1 text-xs text-cyan-600 dark:text-cyan-400">
                          {primary.unit}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(rec.id)}
                      aria-label="删除该条记录"
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Local Data Disclaimer */}
      <div className="mt-6 p-3.5 rounded-xl bg-slate-100/80 dark:bg-[#0B1018] border border-slate-200 dark:border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
        <Info className="w-4 h-4 shrink-0 text-slate-400" />
        <span>无云端同步，卸载 App 或清除应用/浏览器数据后本地记录无法恢复。</span>
      </div>

      {/* Confirm Single Delete */}
      <ConfirmModal
        open={pendingDeleteId !== null}
        title="删除测试记录"
        description="确认删除这条本地测试记录吗？删除后将自动重新计算对应模式的个人最佳，且无法恢复。"
        confirmLabel="确认删除"
        onConfirm={() => {
          if (pendingDeleteId) onDeleteRecord(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />

      {/* Confirm Clear All */}
      <ConfirmModal
        open={confirmClearAll}
        title="清空全部历史记录"
        description="此操作将永久清除本机存储的所有测试记录及个人最佳数据，无法撤销。确认继续吗？"
        confirmLabel="确认清空"
        onConfirm={() => {
          onClearAll();
          setConfirmClearAll(false);
        }}
        onCancel={() => setConfirmClearAll(false)}
      />
    </div>
  );
};
