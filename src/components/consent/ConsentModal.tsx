import React, { useState } from 'react';
import { ShieldCheck, ScrollText } from 'lucide-react';
import { PolicyDetailModal } from './PolicyDetailModal';
import { PrivacyPolicyContent } from './PrivacyPolicyContent';
import { UserAgreementContent } from './UserAgreementContent';

interface ConsentModalProps {
  /** 用户点击「同意并继续」时回调（父组件负责落库 + 关闭弹窗） */
  onAgree: () => void;
}

/**
 * 应用启动时的《用户协议与隐私政策》同意弹窗。
 * - 未同意前以顶层遮罩（z-40）阻断主界面使用
 * - 点击协议/政策链接在 z-50 层打开全文详情
 * - 点击「不同意」弹出二次确认；确认拒绝后保持弹窗开启并提示需同意才能使用
 */
export const ConsentModal: React.FC<ConsentModalProps> = ({ onAgree }) => {
  const [detail, setDetail] = useState<'agreement' | 'privacy' | null>(null);
  const [showDecline, setShowDecline] = useState(false);
  const [declinedOnce, setDeclinedOnce] = useState(false);

  return (
    <>
      {/* 同意主弹窗 */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="consent-pop bg-white dark:bg-[#0F1621] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[88vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-5">
              用户协议与隐私政策
            </h3>
            <div className="space-y-2.5 mb-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>(1)《隐私政策》中关于您的自测记录与偏好设置如何在本机存储和使用的说明。</p>
              <p>(2)《隐私政策》中关于信息保护及您所享有相关权利的说明。</p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              阅读完整的
              <button
                type="button"
                onClick={() => setDetail('agreement')}
                className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium mx-0.5"
              >
                《用户服务协议》
              </button>
              和
              <button
                type="button"
                onClick={() => setDetail('privacy')}
                className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium mx-0.5"
              >
                《隐私政策》
              </button>
              了解详细内容。
            </p>
            {declinedOnce && (
              <p className="mt-4 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg px-3 py-2 leading-relaxed">
                您需同意《用户服务协议》与《隐私政策》后方可使用本应用。
              </p>
            )}
          </div>
          <div className="flex border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowDecline(true)}
              className="flex-1 py-3.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              不同意
            </button>
            <div className="w-px bg-slate-100 dark:bg-slate-800" />
            <button
              type="button"
              onClick={onAgree}
              className="flex-1 py-3.5 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 transition-colors"
            >
              同意并继续
            </button>
          </div>
        </div>
      </div>

      {/* 协议全文 */}
      <PolicyDetailModal
        open={detail === 'agreement'}
        onClose={() => setDetail(null)}
        title="用户服务协议"
        icon={<ScrollText className="w-5 h-5" />}
      >
        <UserAgreementContent />
      </PolicyDetailModal>

      {/* 隐私政策全文 */}
      <PolicyDetailModal
        open={detail === 'privacy'}
        onClose={() => setDetail(null)}
        title="隐私政策"
        icon={<ShieldCheck className="w-5 h-5" />}
      >
        <PrivacyPolicyContent />
      </PolicyDetailModal>

      {/* 拒绝二次确认 */}
      {showDecline && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="consent-pop bg-white dark:bg-[#0F1621] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">确认拒绝</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                您确定要拒绝吗？拒绝后将无法使用本应用。
              </p>
            </div>
            <div className="flex border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDecline(false)}
                className="flex-1 py-3.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                取消
              </button>
              <div className="w-px bg-slate-100 dark:bg-slate-800" />
              <button
                type="button"
                onClick={() => {
                  setShowDecline(false);
                  setDeclinedOnce(true);
                }}
                className="flex-1 py-3.5 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
