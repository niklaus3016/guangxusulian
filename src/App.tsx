import React, { useCallback, useEffect, useState } from 'react';
import { Crosshair, History, Settings, BookOpen, AlertCircle, X } from 'lucide-react';
import {
  ActiveTab,
  APP_VERSION,
  AppSettings,
  MODE_META_MAP,
  ModeType,
  PersonalBestMap,
  TestRecord,
} from './types';
import {
  clearAllRecords,
  deleteSingleRecord,
  getBestPrimaryLabel,
  loadPersonalBests,
  loadPolicyConsent,
  loadRecords,
  loadSettings,
  saveNewRecord,
  savePolicyConsent,
  saveSettings,
} from './utils/storage';
import { triggerCompleteFeedback } from './utils/feedback';
import { HomeView } from './components/HomeView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { TestReport } from './components/TestReport';
import { GuideModal } from './components/GuideModal';
import { ConsentModal } from './components/consent/ConsentModal';
import { TapSpeedTest } from './components/modes/TapSpeedTest';
import { RhythmFollowTest } from './components/modes/RhythmFollowTest';
import { ReactionTimeTest } from './components/modes/ReactionTimeTest';
import { ContinuousSlideTest } from './components/modes/ContinuousSlideTest';
import { MultiMatrixTest } from './components/modes/MultiMatrixTest';

interface ReportState {
  record: TestRecord | null;
  abortedReason?: string;
  isNewBest: boolean;
  previousBestValue?: string | null;
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [records, setRecords] = useState<TestRecord[]>(() => loadRecords());
  const [personalBests, setPersonalBests] = useState<PersonalBestMap>(() => loadPersonalBests());

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [activeMode, setActiveMode] = useState<ModeType | null>(null);
  const [testRunKey, setTestRunKey] = useState<number>(0);
  const [reportState, setReportState] = useState<ReportState | null>(null);
  const [guideOpen, setGuideOpen] = useState<boolean>(false);
  const [backgroundNotice, setBackgroundNotice] = useState<string | null>(null);
  const [policyAgreed, setPolicyAgreed] = useState<boolean>(() => {
    const consent = loadPolicyConsent();
    return consent.agreed && consent.version === APP_VERSION;
  });

  // Sync theme class on mount & updates
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Auto-abort active test when app/tab goes into background (visibilitychange)
  useEffect(() => {
    if (!activeMode || reportState) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setActiveMode(null);
        setReportState(null);
        setActiveTab('home');
        setBackgroundNotice('检测到切屏或切入后台，进行中的测试已自动终止，本次数据未计入记录。');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeMode, reportState]);

  const handleSelectMode = useCallback((mode: ModeType) => {
    setBackgroundNotice(null);
    setReportState(null);
    setActiveMode(mode);
    setTestRunKey((k) => k + 1);
  }, []);

  const handleExitToHome = useCallback(() => {
    setActiveMode(null);
    setReportState(null);
    setActiveTab('home');
  }, []);

  const handleTestFinish = useCallback(
    (record: TestRecord) => {
      const prevBest = personalBests[record.modeType];
      const prevBestLabel = prevBest ? getBestPrimaryLabel(record.modeType, prevBest) : null;
      const { records: updatedRecords, bests: updatedBests, isNewBest } = saveNewRecord(record);

      setRecords(updatedRecords);
      setPersonalBests(updatedBests);
      triggerCompleteFeedback(settings);

      setReportState({
        record,
        isNewBest,
        previousBestValue: isNewBest ? prevBestLabel : null,
      });
    },
    [personalBests, settings],
  );

  const handleTestAbort = useCallback((reason: string) => {
    setReportState({
      record: null,
      abortedReason: reason,
      isNewBest: false,
    });
  }, []);

  const handleRetryTest = useCallback(() => {
    setReportState(null);
    setTestRunKey((k) => k + 1);
  }, []);

  const handleDeleteRecord = useCallback((id: string) => {
    const { records: nextRecords, bests: nextBests } = deleteSingleRecord(id);
    setRecords(nextRecords);
    setPersonalBests(nextBests);
  }, []);

  const handleClearAllRecords = useCallback(() => {
    const { records: nextRecords, bests: nextBests } = clearAllRecords();
    setRecords(nextRecords);
    setPersonalBests(nextBests);
  }, []);

  const isInTestSession = activeMode !== null;

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 text-slate-900 dark:bg-[#070B11] dark:text-slate-100 transition-colors duration-150">
      {/* Top Navigation Bar (Hidden during active tests for full focus & 15% cap compliance) */}
      {!isInTestSession && (
        <header className="sticky top-0 z-30 h-14 bg-white/90 dark:bg-[#070B11]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
          <div className="max-w-5xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
            {/* Zone 1: Single-line brand wordmark */}
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
            >
              光序速练
            </button>

            {/* Zone 2: Desktop concise nav links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className={`py-1 whitespace-nowrap shrink-0 transition-colors ${
                  activeTab === 'home'
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                自测训练
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`py-1 whitespace-nowrap shrink-0 transition-colors ${
                  activeTab === 'history'
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                历史记录
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`py-1 whitespace-nowrap shrink-0 transition-colors ${
                  activeTab === 'settings'
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                参数设置
              </button>
            </nav>

            {/* Zone 3: Single primary action */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 text-xs font-medium hover:bg-slate-800 dark:hover:bg-cyan-400 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5" />
                操作引导
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Background Abort Notice Banner */}
        {!isInTestSession && backgroundNotice && (
          <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-4">
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-4 py-3 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{backgroundNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setBackgroundNotice(null)}
                className="p-1 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-900/50"
                aria-label="关闭提示"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Active Test Report or Active Mode */}
        {isInTestSession ? (
          reportState ? (
            <TestReport
              record={reportState.record}
              abortedReason={reportState.abortedReason}
              abortedModeName={MODE_META_MAP[activeMode].name}
              isNewBest={reportState.isNewBest}
              previousBestValue={reportState.previousBestValue}
              onRetry={handleRetryTest}
              onHome={handleExitToHome}
            />
          ) : (
            <React.Fragment key={`${activeMode}_${testRunKey}`}>
              {activeMode === 'tap_speed' && (
                <TapSpeedTest
                  settings={settings}
                  onFinish={handleTestFinish}
                  onExit={handleExitToHome}
                />
              )}
              {activeMode === 'rhythm_follow' && (
                <RhythmFollowTest
                  settings={settings}
                  onFinish={handleTestFinish}
                  onExit={handleExitToHome}
                />
              )}
              {activeMode === 'reaction_time' && (
                <ReactionTimeTest
                  settings={settings}
                  onFinish={handleTestFinish}
                  onExit={handleExitToHome}
                />
              )}
              {activeMode === 'continuous_slide' && (
                <ContinuousSlideTest
                  settings={settings}
                  onFinish={handleTestFinish}
                  onAbort={handleTestAbort}
                  onExit={handleExitToHome}
                />
              )}
              {activeMode === 'multi_matrix' && (
                <MultiMatrixTest
                  settings={settings}
                  onFinish={handleTestFinish}
                  onExit={handleExitToHome}
                />
              )}
            </React.Fragment>
          )
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                personalBests={personalBests}
                totalRecordsCount={records.length}
                onSelectMode={handleSelectMode}
                onOpenGuide={() => setGuideOpen(true)}
                onNavigateHistory={() => setActiveTab('history')}
                onNavigateSettings={() => setActiveTab('settings')}
              />
            )}
            {activeTab === 'history' && (
              <HistoryView
                records={records}
                personalBests={personalBests}
                onDeleteRecord={handleDeleteRecord}
                onClearAll={handleClearAllRecords}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                recordsCount={records.length}
                onUpdateSettings={setSettings}
                onClearAllRecords={handleClearAllRecords}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Tab Bar (Thumb Zone Ergonomics, hidden on desktop & during tests) */}
      {!isInTestSession && (
        <nav
          aria-label="主导航"
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0B1018]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe"
        >
          <div className="grid grid-cols-3 h-14 items-center">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
                activeTab === 'home'
                  ? 'text-cyan-600 dark:text-cyan-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Crosshair className="w-5 h-5" />
              <span className="text-[11px] font-medium">自测训练</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
                activeTab === 'history'
                  ? 'text-cyan-600 dark:text-cyan-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-[11px] font-medium">历史记录</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
                activeTab === 'settings'
                  ? 'text-cyan-600 dark:text-cyan-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[11px] font-medium">参数设置</span>
            </button>
          </div>
        </nav>
      )}

      {/* Operational Guide Modal */}
      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Startup consent: blocks usage until user agrees */}
      {!policyAgreed && (
        <ConsentModal
          onAgree={() => {
            savePolicyConsent(APP_VERSION);
            setPolicyAgreed(true);
          }}
        />
      )}
    </div>
  );
}
