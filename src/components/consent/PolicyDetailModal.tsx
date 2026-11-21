import React from 'react';
import { X } from 'lucide-react';

interface PolicyDetailModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 通用协议/政策详情弹窗：用于展示《用户服务协议》《隐私政策》全文。
 * 层叠在启动同意弹窗之上（z-50 > 同意弹窗 z-40）。
 */
export const PolicyDetailModal: React.FC<PolicyDetailModalProps> = ({
  open,
  onClose,
  title,
  icon,
  children,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="consent-pop bg-white dark:bg-[#0F1621] rounded-3xl w-full max-w-3xl h-[85vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0B1018] px-5 py-6 sm:px-8">
          {children}
        </div>
      </div>
    </div>
  );
};
