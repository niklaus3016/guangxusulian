import React, { useEffect, useState } from 'react';
import { AppSettings } from '../types';
import { triggerCountdownTick } from '../utils/feedback';

interface CountdownOverlayProps {
  settings: AppSettings;
  modeName: string;
  onComplete: () => void;
  onExit: () => void;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  settings,
  modeName,
  onComplete,
  onExit,
}) => {
  const [step, setStep] = useState<number>(3);

  useEffect(() => {
    triggerCountdownTick(settings, false);

    const t1 = setTimeout(() => {
      setStep(2);
      triggerCountdownTick(settings, false);
    }, 850);

    const t2 = setTimeout(() => {
      setStep(1);
      triggerCountdownTick(settings, false);
    }, 1700);

    const t3 = setTimeout(() => {
      setStep(0);
      triggerCountdownTick(settings, true);
    }, 2550);

    const t4 = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete, settings]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-slate-50/95 dark:bg-[#070B11]/95 backdrop-blur-sm select-none">
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={onExit}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          退出
        </button>
      </div>

      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide mb-6">
        {modeName} · 准备开始
      </p>

      <div className="relative flex items-center justify-center w-36 h-36">
        <div className="absolute inset-0 rounded-full border border-cyan-500/25 dark:border-cyan-400/25" />
        <div className="absolute inset-3 rounded-full border border-cyan-500/15 dark:border-cyan-400/15" />
        <span
          key={step}
          className="font-mono-num text-6xl font-bold text-cyan-600 dark:text-cyan-400 transition-transform duration-150"
        >
          {step > 0 ? step : '开始'}
        </span>
      </div>

      <p className="mt-8 text-xs text-slate-500 dark:text-slate-400">
        请保持专注，测试中途切屏或切换应用将自动终止
      </p>
    </div>
  );
};
