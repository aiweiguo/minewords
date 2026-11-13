/**
 * Tiny Web Audio feedback for speak-as-verb moments (MW-65 / Ship A).
 * No asset files — short oscillator blips; silent if AudioContext blocked.
 */

type SfxKind = "hit" | "loot" | "craft" | "decor";

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    if (!sharedCtx) sharedCtx = new Ctor();
    if (sharedCtx.state === "suspended") {
      void sharedCtx.resume();
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

function tone(
  ctx: AudioContext,
  {
    freq,
    start,
    duration,
    type = "square",
    gain = 0.045,
  }: {
    freq: number;
    start: number;
    duration: number;
    type?: OscillatorType;
    gain?: number;
  },
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Play a short game blip. Safe to call from click/speak handlers. */
export function playGameSfx(kind: SfxKind): void {
  const ctx = getCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime;

  if (kind === "hit") {
    tone(ctx, { freq: 220, start: t0, duration: 0.07, type: "square", gain: 0.05 });
    tone(ctx, { freq: 330, start: t0 + 0.05, duration: 0.08, type: "triangle", gain: 0.04 });
    return;
  }

  if (kind === "loot") {
    tone(ctx, { freq: 523, start: t0, duration: 0.09, type: "triangle", gain: 0.05 });
    tone(ctx, { freq: 659, start: t0 + 0.08, duration: 0.1, type: "triangle", gain: 0.045 });
    tone(ctx, { freq: 784, start: t0 + 0.16, duration: 0.14, type: "sine", gain: 0.04 });
    return;
  }

  if (kind === "craft") {
    // craft success
    tone(ctx, { freq: 392, start: t0, duration: 0.1, type: "triangle", gain: 0.05 });
    tone(ctx, { freq: 523, start: t0 + 0.09, duration: 0.12, type: "triangle", gain: 0.045 });
    tone(ctx, { freq: 659, start: t0 + 0.2, duration: 0.16, type: "sine", gain: 0.04 });
    return;
  }

  // decor light — one soft sparkle (MW-69 / Ship E)
  tone(ctx, { freq: 587, start: t0, duration: 0.08, type: "sine", gain: 0.04 });
  tone(ctx, { freq: 784, start: t0 + 0.07, duration: 0.1, type: "triangle", gain: 0.045 });
  tone(ctx, { freq: 988, start: t0 + 0.15, duration: 0.16, type: "sine", gain: 0.035 });
}
