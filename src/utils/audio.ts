"use client";

function getAudioContext(): AudioContext | null {
  try {
    const AudioCtx = window.AudioContext
      || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    return new AudioCtx();
  } catch {
    return null;
  }
}

export function playTone(
  options: {
    frequency?: number;
    endFrequency?: number;
    type?: OscillatorType;
    gain?: number;
    duration?: number;
  } = {},
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const {
    frequency = 440,
    endFrequency,
    type = "triangle",
    gain: gainValue = 0.04,
    duration = 0.12,
  } = options;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  if (endFrequency !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(endFrequency, ctx.currentTime + duration);
  }
  gain.gain.setValueAtTime(gainValue, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function playArpeggio(
  notes: { frequency: number; start: number; duration: number }[],
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  for (const { frequency, start, duration } of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + start);
    gain.gain.setValueAtTime(0.08, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration);
  }
}
