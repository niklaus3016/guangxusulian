export const APP_PACKAGE_ID = 'com.gxsl.app';
export const APP_VERSION = '1.0';

export type ModeType =
  | 'tap_speed'
  | 'rhythm_follow'
  | 'reaction_time'
  | 'continuous_slide'
  | 'multi_matrix';

export type ThemeMode = 'dark' | 'light';
export type DotShape = 'circle' | 'square';
export type DotSize = 'small' | 'medium' | 'large';

export interface AppSettings {
  theme: ThemeMode;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  dotShape: DotShape;
  dotSize: DotSize;
  tapMissPenalty: boolean;
}

export interface RecordDetails {
  configLabel: string;
  peakCps?: number;
  accuracyPct?: number;
  roundTimesMs?: number[];
  fastestMs?: number;
  slowestMs?: number;
  avgOffsetMs?: number;
  rhythmIndex?: number;
  nodeCount?: number;
  orderErrors?: number;
  missedNodes?: number;
  matrixSize?: string;
  milestoneNote?: string;
}

export interface TestRecord {
  id: string;
  modeType: ModeType;
  createTime: number;
  score: number; // 综合指数
  cps: number;
  reactionMs: number | null;
  totalClick: number;
  validClick: number;
  miss: number;
  costTime: number; // seconds
  details?: RecordDetails;
}

export type PersonalBestMap = Partial<Record<ModeType, TestRecord>>;

export interface ModeMeta {
  type: ModeType;
  name: string;
  shortDesc: string;
  metricUnit: string;
  metricLabel: string;
  guideSummary: string;
  guideRules: string[];
  isFeatured?: boolean;
}

export const MODE_META_LIST: ModeMeta[] = [
  {
    type: 'tap_speed',
    name: '点按测速',
    shortDesc: '限时或限次点击随机光点，测量每秒点击频率与瞬时峰值',
    metricUnit: 'CPS',
    metricLabel: '点击频率',
    guideSummary: '在指定时长或目标点击数内，持续准确点击随机出现的光点。',
    guideRules: [
      '可选限时模式（10s / 30s / 60s）或限数量模式（50 次 / 100 次）。',
      '点中光点后立即在安全区域生成下一个光点。',
      '默认点击空白处不计失误，可在设置中开启「点空计失误」。',
    ],
    isFeatured: true,
  },
  {
    type: 'rhythm_follow',
    name: '节奏跟测',
    shortDesc: '按节拍依次点亮序列点位，评估时序同步度与平均偏差',
    metricUnit: '指数',
    metricLabel: '节奏同步指数',
    guideSummary: '观察点位按固定节拍依次亮起，在光点亮起窗口内完成点击。',
    guideRules: [
      '支持慢速、中速、快速、极速四档节拍间隔。',
      '支持固定顺序或随机序列两种节拍路径。',
      '过早抢按或超时未按将计为一次失误，系统记录每次时差。',
    ],
  },
  {
    type: 'reaction_time',
    name: '反应测速',
    shortDesc: '随机等待后光点亮起，以毫秒精度测量视觉反应时延',
    metricUnit: 'ms',
    metricLabel: '平均反应时延',
    guideSummary: '屏幕等待 1～5 秒随机间隔后突然亮起光点，立即点击屏幕。',
    guideRules: [
      '每次完整测试连续采集 5 轮有效反应数据。',
      '光点未亮起前提前点击判定无效，当前轮次重新等待。',
      '统计平均反应时延、最快与最慢单轮数据。',
    ],
  },
  {
    type: 'continuous_slide',
    name: '连贯滑动测试',
    shortDesc: '手指不抬起按序号连续滑过光点，测试连续轨迹流畅度',
    metricUnit: 's',
    metricLabel: '完成耗时',
    guideSummary: '按编号 1→2→3… 顺序，手指保持按压不抬起连续穿过所有光点。',
    guideRules: [
      '可选 6 个、12 个或 20 个有序光点。',
      '滑过中途抬起手指、漏点或滑错序号将立即中止本次测试。',
      '完整滑过全部序号后记录总耗时。',
    ],
  },
  {
    type: 'multi_matrix',
    name: '多指矩阵测试',
    shortDesc: 'N×N 矩阵方格随机点亮，适合多指交替点击操作自测',
    metricUnit: 'CPS',
    metricLabel: '矩阵频率',
    guideSummary: '在 3×3 或 4×4 矩阵中，快速点击随机高亮的目标方格。',
    guideRules: [
      '支持 3×3 与 4×4 两种矩阵规格，可多指并行响应。',
      '同时保持 2 个目标方格高亮，点中即刻补充新目标。',
      '点击未高亮方格计为失误，测试结束统计 CPS 与准确率。',
    ],
  },
];

export const MODE_META_MAP: Record<ModeType, ModeMeta> = MODE_META_LIST.reduce(
  (acc, item) => {
    acc[item.type] = item;
    return acc;
  },
  {} as Record<ModeType, ModeMeta>,
);

export type ActiveTab = 'home' | 'history' | 'settings';
