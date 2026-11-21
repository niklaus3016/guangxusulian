import { AppSettings } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq: number, durationMs: number, type: OscillatorType = 'sine', gainVal = 0.08): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // ignore audio block errors
  }
}

export function triggerHitFeedback(settings: AppSettings, pitchOffset = 0): void {
  if (settings.soundEnabled) {
    playTone(720 + pitchOffset, 48, 'sine', 0.08);
  }
  if (settings.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(12);
  }
}

export function triggerMissFeedback(settings: AppSettings): void {
  if (settings.soundEnabled) {
    playTone(210, 95, 'triangle', 0.09);
  }
  if (settings.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([24, 24, 24]);
  }
}

export function triggerCountdownTick(settings: AppSettings, isStart = false): void {
  if (settings.soundEnabled) {
    if (isStart) {
      playTone(960, 140, 'sine', 0.1);
    } else {
      playTone(540, 70, 'sine', 0.07);
    }
  }
}

export function triggerCompleteFeedback(settings: AppSettings): void {
  if (settings.soundEnabled) {
    playTone(660, 80, 'sine', 0.08);
    setTimeout(() => playTone(880, 140, 'sine', 0.08), 85);
  }
  if (settings.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([18, 30, 28]);
  }
}

export function getDotDimensions(size: AppSettings['dotSize']): number {
  switch (size) {
    case 'small':
      return 48;
    case 'large':
      return 74;
    case 'medium':
    default:
      return 60;
  }
}
