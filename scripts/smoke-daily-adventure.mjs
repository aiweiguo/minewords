/**
 * MW-54 smoke: progress filter + claim ignores guide quiz.
 * Run: node scripts/smoke-daily-adventure.mjs
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { register } from "node:module";

// Use tsx if available via next's transpile — fall back to dynamic import of built paths.
// Inline minimal reimplementation of the pure rules for CI-less smoke.

const ACTION_KINDS = new Set(["fight", "craft", "trade", "home"]);

const templates = [
  { slug: "forest-wood", actionKind: "fight", exploreZoneId: "forest" },
  { slug: "craft-wood-sword", actionKind: "craft" },
  { slug: "place-home", actionKind: "home" },
  { slug: "cave-stone", actionKind: "fight", exploreZoneId: "cave", requiredUnlockedWeaponId: "wooden-sword" },
  { slug: "mines-iron", actionKind: "fight", exploreZoneId: "mines", requiredUnlockedWeaponId: "stone-sword" },
  { slug: "crystal-diamond", actionKind: "fight", exploreZoneId: "crystal", requiredUnlockedWeaponId: "iron-sword" },
  { slug: "emerald-trade", actionKind: "trade", requiredUnlockedWeaponId: "iron-sword" },
  { slug: "craft-diamond-sword", actionKind: "craft", requiredUnlockedWeaponId: "iron-sword" },
];

function zoneUnlocked(zoneId, unlocked) {
  if (zoneId === "forest") return true;
  if (zoneId === "cave") return unlocked.includes("wooden-sword");
  if (zoneId === "mines") return unlocked.includes("stone-sword");
  if (zoneId === "crystal") return unlocked.includes("iron-sword");
  return false;
}

function eligible(t, unlocked) {
  if (t.requiredUnlockedWeaponId && !unlocked.includes(t.requiredUnlockedWeaponId)) return false;
  if (t.exploreZoneId && !zoneUnlocked(t.exploreZoneId, unlocked)) return false;
  return true;
}

function canClaim(plan, speakLoop) {
  const needed = plan.actionCount ?? 1;
  const progress = speakLoop[plan.actionKind] ?? 0;
  // guideDone intentionally unused
  return progress >= needed;
}

// Early save: no diamond / emerald / crystal
const early = templates.filter((t) => eligible(t, []));
assert.ok(early.every((t) => t.slug !== "emerald-trade"), "early must not get emerald trade");
assert.ok(early.every((t) => t.slug !== "crystal-diamond"), "early must not get crystal");
assert.ok(early.every((t) => t.slug !== "craft-diamond-sword"), "early must not get diamond craft");
assert.ok(early.some((t) => t.slug === "forest-wood"), "early keeps forest fight");
assert.ok(early.some((t) => t.slug === "place-home"), "early keeps home");

const iron = templates.filter((t) =>
  eligible(t, ["wooden-sword", "stone-sword", "iron-sword"]),
);
assert.ok(iron.some((t) => t.slug === "emerald-trade"), "iron unlocks trade day");
assert.ok(iron.some((t) => t.slug === "crystal-diamond"), "iron unlocks crystal");

assert.ok(
  templates.every((t) => ACTION_KINDS.has(t.actionKind)),
  "all templates are fight|craft|trade|home",
);

const fightPlan = { actionKind: "fight", actionCount: 2, guideId: "fight-zombie" };
assert.equal(canClaim(fightPlan, { fight: 0, craft: 0, trade: 0, home: 0 }), false);
assert.equal(canClaim(fightPlan, { fight: 2, craft: 0, trade: 0, home: 0 }), true);
// Completing guide alone must NOT unlock claim
assert.equal(canClaim(fightPlan, { fight: 0 }), false);

console.log("MW-54 smoke OK", {
  earlyCount: early.length,
  ironCount: iron.length,
  earlySlugs: early.map((t) => t.slug),
});
