/**
 * MW-56 smoke: mic-path confirm demotion constants + parent ratio helpers.
 * Run: node scripts/smoke-confirm-demote.mjs
 */
import assert from "node:assert/strict";

/** Mirrors src/lib/followConfirm.ts (keep in sync). */
const MIC_CONFIRM_HOLD_MS = 900;
const MIC_CONFIRM_STREAK_NUDGE_AT = 2;

function shouldNudgeSpeakMore(streak) {
  return streak >= MIC_CONFIRM_STREAK_NUDGE_AT;
}

function isMostlyConfirmToday(speakCompletions, confirmCompletions) {
  const total = speakCompletions + confirmCompletions;
  if (total <= 0) return false;
  return confirmCompletions > speakCompletions;
}

function confirmSharePercent(speakCompletions, confirmCompletions) {
  const total = speakCompletions + confirmCompletions;
  if (total <= 0) return null;
  return Math.round((confirmCompletions / total) * 100);
}

assert.equal(MIC_CONFIRM_HOLD_MS >= 500, true, "hold should feel deliberate");
assert.equal(MIC_CONFIRM_STREAK_NUDGE_AT, 2);
assert.equal(shouldNudgeSpeakMore(0), false);
assert.equal(shouldNudgeSpeakMore(1), false);
assert.equal(shouldNudgeSpeakMore(2), true);
assert.equal(confirmSharePercent(0, 0), null);
assert.equal(confirmSharePercent(2, 2), 50);
assert.equal(isMostlyConfirmToday(1, 3), true);
assert.equal(isMostlyConfirmToday(3, 1), false);

console.log("MW-56 smoke OK", {
  holdMs: MIC_CONFIRM_HOLD_MS,
  nudgeAt: MIC_CONFIRM_STREAK_NUDGE_AT,
});
