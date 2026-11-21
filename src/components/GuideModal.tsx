import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { MODE_META_LIST } from '../types';

interface GuideModalProps {
  open: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
    >
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 id="guide-modal-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
              测试模式操作引导
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
            aria-label="关闭引导"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {MODE_META_LIST.map((mode, index) => (
            <div
              key={mode.type}
              className={index > 0 ? 'pt-5 border-t border-slate-100 dark:border-slate-800/80' : ''}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  0{index + 1}. {mode.name}
                </h3>
                <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                  核心指标：{mode.metricLabel}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                {mode.guideSummary}
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400 list-disc list-inside">
                {mode.guideRules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1018]/60">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 text-white text-sm font-semibold transition-colors"
          >
            我已了解，开始训练
          </button>
        </div>
      </div>
    </div>
  );
};
