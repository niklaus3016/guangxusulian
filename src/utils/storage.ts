import { AppSettings, ModeType, PersonalBestMap, TestRecord } from '../types';

const SETTINGS_KEY = 'guangxu_settings_v1';
const RECORDS_KEY = 'guangxu_records_v1';
const BESTS_KEY = 'guangxu_bests_v1';
const CONSENT_KEY = 'guangxu_policy_consent_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  soundEnabled: true,
  vibrationEnabled: true,
  dotShape: 'circle',
  dotSize: 'medium',
  tapMissPenalty: false,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {
    // ignore quota errors
  }
}

export function loadRecords(): TestRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.createTime - a.createTime);
  } catch {
    return [];
  }
}

export function loadPersonalBests(): PersonalBestMap {
  try {
    const raw = localStorage.getItem(BESTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

export function isRecordBetter(candidate: TestRecord, currentBest?: TestRecord): boolean {
  if (!currentBest) return true;
  switch (candidate.modeType) {
    case 'tap_speed':
    case 'multi_matrix':
      if (candidate.cps !== currentBest.cps) {
        return candidate.cps > currentBest.cps;
      }
      return candidate.score > currentBest.score;
    case 'rhythm_follow':
      if (candidate.score !== currentBest.score) {
        return candidate.score > currentBest.score;
      }
      return (candidate.details?.avgOffsetMs ?? 999) < (currentBest.details?.avgOffsetMs ?? 999);
    case 'reaction_time': {
      const cMs = candidate.reactionMs ?? Number.MAX_SAFE_INTEGER;
      const bMs = currentBest.reactionMs ?? Number.MAX_SAFE_INTEGER;
      return cMs < bMs;
    }
    case 'continuous_slide':
      return candidate.costTime < currentBest.costTime;
    default:
      return candidate.score > currentBest.score;
  }
}

export function recomputePersonalBests(records: TestRecord[]): PersonalBestMap {
  const bests: PersonalBestMap = {};
  for (const rec of records) {
    const existing = bests[rec.modeType];
    if (isRecordBetter(rec, existing)) {
      bests[rec.modeType] = rec;
    }
  }
  return bests;
}

export function saveNewRecord(record: TestRecord): {
  records: TestRecord[];
  bests: PersonalBestMap;
  isNewBest: boolean;
} {
  const existing = loadRecords();
  const currentBests = loadPersonalBests();
  const isNewBest = isRecordBetter(record, currentBests[record.modeType]);

  const updatedRecords = [record, ...existing].slice(0, 500);
  const updatedBests = isNewBest
    ? { ...currentBests, [record.modeType]: record }
    : currentBests;

  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
    localStorage.setItem(BESTS_KEY, JSON.stringify(updatedBests));
  } catch {
    // ignore storage limits
  }

  return {
    records: updatedRecords,
    bests: updatedBests,
    isNewBest,
  };
}

export function deleteSingleRecord(id: string): {
  records: TestRecord[];
  bests: PersonalBestMap;
} {
  const existing = loadRecords();
  const updatedRecords = existing.filter((r) => r.id !== id);
  const updatedBests = recomputePersonalBests(updatedRecords);

  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
    localStorage.setItem(BESTS_KEY, JSON.stringify(updatedBests));
  } catch {
    // ignore
  }

  return { records: updatedRecords, bests: updatedBests };
}

export function clearAllRecords(): {
  records: TestRecord[];
  bests: PersonalBestMap;
} {
  try {
    localStorage.removeItem(RECORDS_KEY);
    localStorage.removeItem(BESTS_KEY);
  } catch {
    // ignore
  }
  return { records: [], bests: {} };
}

export function formatRecordPrimaryValue(record: TestRecord): { value: string; unit: string } {
  switch (record.modeType) {
    case 'tap_speed':
    case 'multi_matrix':
      return { value: record.cps.toFixed(2), unit: 'CPS' };
    case 'reaction_time':
      return { value: record.reactionMs !== null ? `${Math.round(record.reactionMs)}` : '--', unit: 'ms' };
    case 'continuous_slide':
      return { value: record.costTime.toFixed(2), unit: 's' };
    case 'rhythm_follow':
      return { value: `${Math.round(record.score)}`, unit: '同步指数' };
    default:
      return { value: `${record.score}`, unit: '' };
  }
}

export function getBestPrimaryLabel(mode: ModeType, record?: TestRecord): string {
  if (!record) return '暂无记录';
  const { value, unit } = formatRecordPrimaryValue(record);
  return `${value} ${unit}`.trim();
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export interface PolicyConsent {
  agreed: boolean;
  /** 用户同意时的应用版本，版本变更后可重新征求同意 */
  version: string;
  timestamp: number;
}

export function loadPolicyConsent(): PolicyConsent {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return { agreed: false, version: '', timestamp: 0 };
    const parsed = JSON.parse(raw);
    return {
      agreed: !!parsed.agreed,
      version: typeof parsed.version === 'string' ? parsed.version : '',
      timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : 0,
    };
  } catch {
    return { agreed: false, version: '', timestamp: 0 };
  }
}

export function savePolicyConsent(version: string): void {
  try {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ agreed: true, version, timestamp: Date.now() })
    );
  } catch {
    // ignore quota errors
  }
}
