/** Soft phase cues via Web Audio — no external files, works offline. */

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx) sharedCtx = new AC();
  return sharedCtx;
}

/** Call from a user gesture (Start) so browsers allow audio. */
export async function unlockBreathAudio(): Promise<void> {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      /* ignore */
    }
  }
}

/**
 * Inhale: slightly higher soft chime.
 * Exhale: lower, a bit longer — easy to tell with eyes closed.
 */
export function playBreathPhaseCue(phase: "inhale" | "exhale"): void {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  // Keep overall volume gentle
  const peak = phase === "inhale" ? 0.07 : 0.055;
  const attack = 0.04;
  const hold = phase === "inhale" ? 0.12 : 0.18;
  const release = phase === "inhale" ? 0.55 : 0.85;
  master.gain.linearRampToValueAtTime(peak, now + attack);
  master.gain.linearRampToValueAtTime(peak * 0.7, now + attack + hold);
  master.gain.exponentialRampToValueAtTime(0.0001, now + attack + hold + release);
  master.connect(ctx.destination);

  const fundamentals =
    phase === "inhale"
      ? [392, 523.25] // G4 + C5 — light lift
      : [261.63, 329.63]; // C4 + E4 — softer settle

  for (const [i, freq] of fundamentals.entries()) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = i === 0 ? "sine" : "triangle";
    osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(i === 0 ? 0.9 : 0.35, now);
    osc.connect(g);
    g.connect(master);
    osc.start(now);
    osc.stop(now + attack + hold + release + 0.05);
  }
}
