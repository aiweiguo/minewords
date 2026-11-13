/**
 * No-mic / no-Web-Speech soft path (MW-42 / P0-3):
 * TTS play → follow-along countdown → then allow tap confirm.
 * Confirm still works, but must pass the hear+follow ritual.
 *
 * Mic path (MW-56 / Ship C): tap-confirm is demoted (collapsed + long-press);
 * consecutive mic-path confirms show a light「今天多开口打」nudge.
 */

export type FollowConfirmPhase =
  | "idle"
  | "playing"
  | "following"
  | "ready";

/** Kid-friendly follow window after TTS ends (~0.45s/word, clamped). */
export function followCountdownMs(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.min(4500, Math.max(1600, words * 450 + 800));
}

export function followCountdownSeconds(text: string): number {
  return Math.max(1, Math.ceil(followCountdownMs(text) / 1000));
}

/** Parent-facing: today mostly cleared via confirm (not mic speak). */
export function isMostlyConfirmToday(
  speakCompletions: number,
  confirmCompletions: number,
): boolean {
  const total = speakCompletions + confirmCompletions;
  if (total <= 0) return false;
  return confirmCompletions > speakCompletions;
}

/** Same threshold as today, for weekly speak/confirm rollup (MW-45). */
export function isMostlyConfirmWeek(
  speakCompletions: number,
  confirmCompletions: number,
): boolean {
  return isMostlyConfirmToday(speakCompletions, confirmCompletions);
}

/** Confirm share 0–100; null when no completions yet. */
export function confirmSharePercent(
  speakCompletions: number,
  confirmCompletions: number,
): number | null {
  const total = speakCompletions + confirmCompletions;
  if (total <= 0) return null;
  return Math.round((confirmCompletions / total) * 100);
}

/** How long to hold the demoted mic-path confirm (MW-56). */
export const MIC_CONFIRM_HOLD_MS = 700;

/** After this many consecutive mic-path confirms, show the speak nudge. */
export const MIC_CONFIRM_STREAK_NUDGE_AT = 2;

export const MIC_CONFIRM_STREAK_STORAGE_KEY = "minewords-mic-confirm-streak";

export function getMicConfirmStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.sessionStorage.getItem(MIC_CONFIRM_STREAK_STORAGE_KEY);
    const n = raw == null ? 0 : Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** Bump streak after a demoted (mic-available) confirm; returns new streak. */
export function bumpMicConfirmStreak(): number {
  if (typeof window === "undefined") return 0;
  const next = getMicConfirmStreak() + 1;
  try {
    window.sessionStorage.setItem(MIC_CONFIRM_STREAK_STORAGE_KEY, String(next));
  } catch {
    // ignore quota / private mode
  }
  return next;
}

/** Mic speak cleared a gate — reset consecutive confirm streak. */
export function resetMicConfirmStreak(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(MIC_CONFIRM_STREAK_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function shouldNudgeSpeakMore(streak: number): boolean {
  return streak >= MIC_CONFIRM_STREAK_NUDGE_AT;
}
