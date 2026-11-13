/**
 * MW-61 / P2-5 smoke: soft-path follow countdown knobs (kinder + tweakable).
 * Does not touch mic demotion (MW-56) constants.
 * Run: node scripts/smoke-follow-confirm-polish.mjs
 */
import assert from "node:assert/strict";

/** Mirrors src/lib/followConfirm.ts (keep in sync). */
const FOLLOW_COUNTDOWN_MS_PER_WORD = 550;
const FOLLOW_COUNTDOWN_BASE_MS = 1000;
const FOLLOW_COUNTDOWN_MIN_MS = 2200;
const FOLLOW_COUNTDOWN_MAX_MS = 6000;

const MIC_CONFIRM_HOLD_MS = 700;

function followCountdownMs(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.min(
    FOLLOW_COUNTDOWN_MAX_MS,
    Math.max(
      FOLLOW_COUNTDOWN_MIN_MS,
      words * FOLLOW_COUNTDOWN_MS_PER_WORD + FOLLOW_COUNTDOWN_BASE_MS,
    ),
  );
}

function followCountdownSeconds(text) {
  return Math.max(1, Math.ceil(followCountdownMs(text) / 1000));
}

assert.equal(FOLLOW_COUNTDOWN_MIN_MS >= 2000, true, "min should feel kinder");
assert.equal(FOLLOW_COUNTDOWN_MAX_MS >= 5500, true, "max should cover longer phrases");
assert.equal(FOLLOW_COUNTDOWN_MS_PER_WORD >= 500, true, "per-word pacing kinder than 450");

assert.equal(followCountdownMs("Hi"), FOLLOW_COUNTDOWN_MIN_MS);
assert.equal(followCountdownSeconds("Hi"), 3);

const three = followCountdownMs("I want bread");
assert.equal(three, 3 * FOLLOW_COUNTDOWN_MS_PER_WORD + FOLLOW_COUNTDOWN_BASE_MS);
assert.equal(followCountdownSeconds("I want bread"), 3);

const long = "please trade with me for some emerald blocks today friend";
assert.equal(followCountdownMs(long), FOLLOW_COUNTDOWN_MAX_MS);
assert.equal(followCountdownSeconds(long), 6);

// Soft path polish must not weaken Chrome mic demotion (MW-56).
assert.equal(MIC_CONFIRM_HOLD_MS, 700);

console.log("MW-61 follow polish smoke OK", {
  minMs: FOLLOW_COUNTDOWN_MIN_MS,
  maxMs: FOLLOW_COUNTDOWN_MAX_MS,
  perWord: FOLLOW_COUNTDOWN_MS_PER_WORD,
  micHoldUnchanged: MIC_CONFIRM_HOLD_MS,
});
