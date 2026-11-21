import React from 'react';
import {
  Crosshair,
  Activity,
  Zap,
  GitCommitHorizontal,
  Grid3x3,
  ArrowRight,
  BookOpen,
  History,
  Settings,
} from 'lucide-react';
import { MODE_META_LIST, ModeType, PersonalBestMap } from '../types';
import { getBestPrimaryLabel } from '../utils/storage';

interface HomeViewProps {
  personalBests: PersonalBestMap;
  totalRecordsCount: number;
  onSelectMode: (mode: ModeType) => void;
  onOpenGuide: () => void;
  onNavigateHistory: () => void;
  onNavigateSettings: () => void;
}

const MODE_ICONS: Record<ModeType, React.ReactNode> = {
  tap_speed: <Crosshair className="w-5 h-5" />,
  rhythm_follow: <Activity className="w-5 h-5" />,
  reaction_time: <Zap className="w-5 h-5" />,
  continuous_slide: <GitCommitHorizontal className="w-5 h-5" />,
  multi_matrix: <Grid3x3 className="w-5 h-5" />,
};

export const HomeView: React.FC<HomeViewProps> = ({
  personalBests,
  totalRecordsCount,
  onSelectMode,
  onOpenGuide,
  onNavigateHistory,
  onNavigateSettings,
}) => {
  const featured = MODE_META_LIST[0];
  const secondaryModes = MODE_META_LIST.slice(1);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-24 lg:pb-12">
      {/* Intro & Quick Actions Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            光序速练
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            指尖时序，速练随心 · 指尖操作能力自测与训练工具
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onOpenGuide}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1621] text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            操作引导
          </button>
          <button
            type="button"
            onClick={onNavigateHistory}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1621] text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap lg:hidden"
          >
            <History className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            历史记录 ({totalRecordsCount})
          </button>
          <button
            type="button"
            onClick={onNavigateSettings}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1621] text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap lg:hidden"
          >
            <Settings className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            设置
          </button>
        </div>
      </section>

      {/* Featured Core Mode Card: 点按测速 */}
      <section className="mt-6">
        <button
          type="button"
          onClick={() => onSelectMode(featured.type)}
          className="group w-full text-left rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 p-5 sm:p-6 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/70 dark:border-cyan-800/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                {MODE_ICONS[featured.type]}
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="text-cyan-600 dark:text-cyan-400 font-medium">核心自测项</span>
                  <span aria-hidden="true">·</span>
                  <span>支持限时 / 限次</span>
                </div>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                  {featured.name}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {featured.shortDesc}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 shrink-0">
              <div className="sm:text-right">
                <span className="block text-xs text-slate-500 dark:text-slate-400">个人最佳</span>
                <span className="font-mono-num text-lg font-semibold text-slate-900 dark:text-cyan-300">
                  {getBestPrimaryLabel(featured.type, personalBests[featured.type])}
                </span>
              </div>
              <span className="min-h-[44px] px-4 py-2.5 rounded-xl bg-cyan-600 group-hover:bg-cyan-700 dark:bg-cyan-500 dark:text-slate-950 dark:group-hover:bg-cyan-400 text-white text-sm font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap">
                进入测试
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </button>
      </section>

      {/* Remaining 4 Testing Modes Grid */}
      <section className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {secondaryModes.map((mode, idx) => {
          const best = personalBests[mode.type];
          return (
            <button
              key={mode.type}
              type="button"
              onClick={() => onSelectMode(mode.type)}
              className="group text-left rounded-2xl bg-white dark:bg-[#0F1621] border border-slate-200 dark:border-slate-800 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 p-5 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#151F2E] text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    {MODE_ICONS[mode.type]}
                  </div>
                  <span className="text-xs font-mono-num text-slate-400 dark:text-slate-500">
                    0{idx + 2}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {mode.name}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {mode.shortDesc}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span>个人最佳：</span>
                  <span className="font-mono-num font-semibold text-slate-800 dark:text-slate-200">
                    {getBestPrimaryLabel(mode.type, best)}
                  </span>
                </div>
                <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 inline-flex items-center gap-1 whitespace-nowrap">
                  进入
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </button>
          );
        })}
      </section>
    </div>
  );
};
