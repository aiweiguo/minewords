/**
 * MW-65 / Ship A smoke: mic demotion knobs + speak-feedback invariants.
 * Run: node scripts/smoke-ship-a-speak-feedback.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Mirrors src/lib/followConfirm.ts (keep in sync). */
const MIC_CONFIRM_HOLD_MS = 900;
const MIC_CONFIRM_STREAK_NUDGE_AT = 2;
const MIC_CONFIRM_SPEAK_NUDGE_CN = "今天多开口";

function shouldNudgeSpeakMore(streak) {
  return streak >= MIC_CONFIRM_STREAK_NUDGE_AT;
}

assert.equal(MIC_CONFIRM_HOLD_MS >= 800, true, "further demote: longer hold");
assert.equal(MIC_CONFIRM_STREAK_NUDGE_AT, 2);
assert.equal(MIC_CONFIRM_SPEAK_NUDGE_CN, "今天多开口");
assert.equal(shouldNudgeSpeakMore(1), false);
assert.equal(shouldNudgeSpeakMore(2), true);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const followSrc = readFileSync(join(root, "src/lib/followConfirm.ts"), "utf8");
assert.match(followSrc, /MIC_CONFIRM_HOLD_MS = 900/);
assert.match(followSrc, /MIC_CONFIRM_SPEAK_NUDGE_CN = "今天多开口"/);

const controlsSrc = readFileSync(
  join(root, "src/components/FollowConfirmControls.tsx"),
  "utf8",
);
assert.match(controlsSrc, /MIC_CONFIRM_SPEAK_NUDGE_CN/);
assert.match(controlsSrc, /再听一遍 Listen again/);
assert.match(controlsSrc, /mw-follow-failed/);
assert.match(controlsSrc, /跟读失败 — 再听一遍/);

const monsterSrc = readFileSync(
  join(root, "src/components/WordMonsterCard.tsx"),
  "utf8",
);
assert.match(monsterSrc, /playGameSfx\("hit"\)/);
assert.match(monsterSrc, /playGameSfx\("loot"\)/);
assert.match(monsterSrc, /mw-loot-chip/);
assert.match(monsterSrc, /mw-hit-flash/);

const craftSrc = readFileSync(
  join(root, "src/components/SpeakCraftPanel.tsx"),
  "utf8",
);
assert.match(craftSrc, /playGameSfx\("craft"\)/);
assert.match(craftSrc, /mw-craft-success-flash/);
assert.match(craftSrc, /celebrateCraft/);

const sfxSrc = readFileSync(join(root, "src/lib/gameSfx.ts"), "utf8");
assert.match(sfxSrc, /export function playGameSfx/);
assert.match(sfxSrc, /kind === "hit"/);
assert.match(sfxSrc, /kind === "loot"/);
assert.match(sfxSrc, /craft/);

const css = readFileSync(join(root, "src/styles/globals.css"), "utf8");
assert.match(css, /\.mw-hit-flash-burst/);
assert.match(css, /\.mw-loot-chip/);
assert.match(css, /\.mw-craft-success-flash/);
assert.match(css, /\.mw-follow-failed-callout/);

console.log("MW-65 Ship A speak-feedback smoke OK", {
  holdMs: MIC_CONFIRM_HOLD_MS,
  nudgeAt: MIC_CONFIRM_STREAK_NUDGE_AT,
  nudgeCn: MIC_CONFIRM_SPEAK_NUDGE_CN,
});
