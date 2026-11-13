/**
 * No-mic / no-Web-Speech soft path (MW-42 / P0-3):
 * TTS play → follow-along countdown → then allow tap confirm.
 * Confirm still works, but must pass the hear+follow ritual.
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
