import React, { useState } from 'react';
import { Moon, Sun, Volume2, VolumeX, Smartphone, Trash2, ShieldCheck, ScrollText, ChevronRight } from 'lucide-react';
import { APP_VERSION, AppSettings, DotShape, DotSize } from '../types';
import { getDotDimensions, triggerHitFeedback } from '../utils/feedback';
import { ConfirmModal } from './ConfirmModal';
import { PolicyDetailModal } from './consent/PolicyDetailModal';
import { PrivacyPolicyContent } from './consent/PrivacyPolicyContent';
import { UserAgreementContent } from './consent/UserAgreementContent';

interface SettingsViewProps {
  settings: AppSettings;
  recordsCount: number;
  onUpdateSettings: (next: AppSettings) => void;
  onClearAllRecords: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  recordsCount,
  onUpdateSettings,
  onClearAllRecords,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [policyDetail, setPolicyDetail] = useState<'privacy' | 'agreement' | null>(null);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = { ...settings, [key]: value };
    onUpdateSettings(next);
    if (key === 'soundEnabled' && value === true) {
      triggerHitFeedback(next);
    }
  };

  const previewSize = getDotDimensions(settings.dotSize);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-5 pb-24 lg:pb-12">
      <div className="pb-5 border-b border-slate-200 dark:border-slate-800/80">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          参数设置
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          所有外观与测试规则配置均即时保存至本机存储
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {/* 1. Theme Switcher */}
        <section className="rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">界面主题</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            默认深色暗光背景可减少视觉刺激，提升光点对比度
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#090E16]">
            <button
              type="button"
              onClick={() => update('theme', 'dark')}
              className={`min-h-[44px] rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                settings.theme === 'dark'
                  ? 'bg-white dark:bg-[#172131] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Moon className="w-4 h-4" />
              深色主题（默认）
            </button>
            <button
              type="button"
              onClick={() => update('theme', 'light')}
              className={`min-h-[44px] rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                settings.theme === 'light'
                  ? 'bg-white dark:bg-[#172131] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sun className="w-4 h-4" />
              浅色主题
            </button>
          </div>
        </section>

        {/* 2 & 3. Audio & Haptic Feedback */}
        <section className="rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80">
          <div className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#151F2E] text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">音效反馈</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  开启倒计时提示音、点中清脆音与测试完成提示音
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.soundEnabled}
              onClick={() => update('soundEnabled', !settings.soundEnabled)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                settings.soundEnabled ? 'bg-cyan-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition duration-150 ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#151F2E] text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">震动反馈</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  点中光点时触发短促触觉震动，失误时触发双振提示（需设备支持）
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.vibrationEnabled}
              onClick={() => update('vibrationEnabled', !settings.vibrationEnabled)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                settings.vibrationEnabled ? 'bg-cyan-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition duration-150 ${
                  settings.vibrationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* 4. Optical Dot Style & Size */}
        <section className="rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">光点样式与尺寸</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                自定义测试目标的几何外形与触控区域大小
              </p>
            </div>
            {/* Live Preview */}
            <div className="w-20 h-20 rounded-xl bg-slate-50 dark:bg-[#090E16] border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
              <div
                style={{ width: previewSize * 0.72, height: previewSize * 0.72 }}
                className={`bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.45)] flex items-center justify-center transition-all ${
                  settings.dotShape === 'circle' ? 'rounded-full' : 'rounded-xl'
                }`}
              >
                <span
                  className={`w-1/3 h-1/3 bg-white/90 ${
                    settings.dotShape === 'circle' ? 'rounded-full' : 'rounded-sm'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">光点形状</label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { key: 'circle', label: '圆形' },
                    { key: 'square', label: '方形' },
                  ] as { key: DotShape; label: string }[]
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => update('dotShape', item.key)}
                    className={`min-h-[44px] rounded-xl border text-xs font-medium transition-colors ${
                      settings.dotShape === item.key
                        ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">光点尺寸</label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { key: 'small', label: '小' },
                    { key: 'medium', label: '中' },
                    { key: 'large', label: '大' },
                  ] as { key: DotSize; label: string }[]
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => update('dotSize', item.key)}
                    className={`min-h-[44px] rounded-xl border text-xs font-medium transition-colors ${
                      settings.dotSize === item.key
                        ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Tap Speed Miss Penalty */}
        <section className="rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">点按测速「点空计失误」</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              开启后，在点按测速模式下点击空白区域将计入失误次数并降低准确率
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.tapMissPenalty}
            onClick={() => update('tapMissPenalty', !settings.tapMissPenalty)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
              settings.tapMissPenalty ? 'bg-cyan-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition duration-150 ${
                settings.tapMissPenalty ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </section>

        {/* 6. User Agreement & Privacy Policy */}
        <section className="rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
          <button
            type="button"
            onClick={() => setPolicyDetail('agreement')}
            className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#151F2E] text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <ScrollText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">用户服务协议</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  查看本应用的服务条款与适用法律说明
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
          <button
            type="button"
            onClick={() => setPolicyDetail('privacy')}
            className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#151F2E] text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">隐私政策</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  查看本机存储、数据使用与最小权限说明
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </section>

        {/* 7. Clear Local Records */}
        <section className="rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">本地测试记录管理</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              当前已缓存 {recordsCount} 条测试记录，清空后不可恢复
            </p>
          </div>
          <button
            type="button"
            disabled={recordsCount === 0}
            onClick={() => setConfirmClear(true)}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40 disabled:pointer-events-none transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4" />
            清除本地记录
          </button>
        </section>

        {/* 8. About */}
        <section className="rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">关于光序速练</h2>
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>应用名称：光序速练 · 版本 <span className="font-mono-num">{APP_VERSION}</span></p>
            <p>
              工具定位：指尖操作自测工具，用于测量点击速度（CPS）、视觉反应时延、节奏同步与连续滑动流畅度。
            </p>
            <p>
              隐私声明：本工具不请求网络权限，不采集任何个人身份信息，无账号体系、无内购，所有数据仅保存在本机。
            </p>
          </div>
        </section>
      </div>

      <PolicyDetailModal
        open={policyDetail === 'agreement'}
        onClose={() => setPolicyDetail(null)}
        title="用户服务协议"
        icon={<ScrollText className="w-5 h-5" />}
      >
        <UserAgreementContent />
      </PolicyDetailModal>
      <PolicyDetailModal
        open={policyDetail === 'privacy'}
        onClose={() => setPolicyDetail(null)}
        title="隐私政策"
        icon={<ShieldCheck className="w-5 h-5" />}
      >
        <PrivacyPolicyContent />
      </PolicyDetailModal>

      <ConfirmModal
        open={confirmClear}
        title="清除全部本地记录"
        description="确认清空所有已保存的历史记录与个人最佳数据吗？此操作无法撤销。"
        confirmLabel="确认清除"
        onConfirm={() => {
          onClearAllRecords();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
};
