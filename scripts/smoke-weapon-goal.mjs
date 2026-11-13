/**
 * MW-62 smoke: weaponGoal selection + post-diamond/home weekly CTA.
 * Mirrors src/lib/weaponGoal.ts + weeklyChallenge rotation (no bundler).
 * Run: node scripts/smoke-weapon-goal.mjs
 */
import assert from "node:assert/strict";

const weaponTiers = [
  { id: "wooden-sword", goalLabelCn: "木剑", costs: [{ resource: "wood", amount: 3 }] },
  { id: "stone-sword", goalLabelCn: "石剑", costs: [{ resource: "stone", amount: 3 }, { resource: "wood", amount: 1 }] },
  { id: "iron-sword", goalLabelCn: "铁剑", costs: [{ resource: "iron", amount: 3 }, { resource: "wood", amount: 1 }] },
  { id: "diamond-sword", goalLabelCn: "钻石剑", costs: [{ resource: "diamond", amount: 2 }, { resource: "wood", amount: 1 }] },
];

const HOME_ROOM_SLOTS = [
  "floor-0",
  "floor-1",
  "floor-2",
  "floor-3",
  "floor-4",
  "floor-5",
  "wall-0",
  "wall-1",
  "wall-2",
  "wall-3",
];

const WEEKLY_ROTATION = [
  { id: "sheep-wool", kind: "zone-monster", target: 1, primaryCta: { kind: "fight", href: "/explore" } },
  { id: "pig-craft", kind: "zone-monster", target: 1, primaryCta: { kind: "fight", href: "/explore" } },
  { id: "villager-3", kind: "villager-chat", target: 3, primaryCta: { kind: "trade", href: "/trade" } },
  { id: "light-3-decor", kind: "light-decor", target: 3, primaryCta: { kind: "home", href: "/#decorate" } },
  { id: "witch-cave", kind: "zone-monster", target: 1, primaryCta: { kind: "fight", href: "/explore" } },
  { id: "light-5-decor", kind: "light-decor", target: 5, primaryCta: { kind: "home", href: "/#decorate" } },
  { id: "enderman-mines", kind: "zone-monster", target: 1, primaryCta: { kind: "fight", href: "/explore" } },
  { id: "villager-3-again", kind: "villager-chat", target: 3, primaryCta: { kind: "trade", href: "/trade" } },
  { id: "dragon-crystal", kind: "zone-monster", target: 1, primaryCta: { kind: "fight", href: "/explore" } },
];

function getCurrentWeaponGoal(unlockedIds) {
  for (const tier of weaponTiers) {
    if (!unlockedIds.includes(tier.id)) return tier;
  }
  return null;
}

function getEquippedWeapon(unlockedIds) {
  let best = null;
  for (const tier of weaponTiers) {
    if (unlockedIds.includes(tier.id)) best = tier;
  }
  return best;
}

function getHomeFillProgress(roomBlocks = {}) {
  const total = HOME_ROOM_SLOTS.length;
  const filled = HOME_ROOM_SLOTS.filter((slot) => Boolean(roomBlocks[slot])).length;
  return { filled, total, empty: Math.max(0, total - filled) };
}

function canAfford(costs, resources) {
  return costs.every((c) => (resources[c.resource] ?? 0) >= c.amount);
}

function hashWeekStart(weekStart) {
  let hash = 0;
  for (let i = 0; i < weekStart.length; i += 1) {
    hash = (hash * 31 + weekStart.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickWeekly(weekStart) {
  return WEEKLY_ROTATION[hashWeekStart(weekStart) % WEEKLY_ROTATION.length];
}

/**
 * Compact status selector mirroring getWeaponGoalSnapshot branches.
 */
function snapshotStatus(unlockedIds, resources, roomBlocks = {}) {
  const goal = getCurrentWeaponGoal(unlockedIds);
  const homeFill = getHomeFillProgress(roomBlocks);
  if (!goal) {
    if (homeFill.empty > 0) return { status: "line-complete", phase: "decorate-home", homeFill };
    const weekly = pickWeekly("2026-11-10"); // fixed Monday for determinism
    return {
      status: "line-complete",
      phase: "weekly",
      homeFill,
      weeklyId: weekly.id,
      ctaKind: weekly.primaryCta.kind,
    };
  }
  if (canAfford(goal.costs, resources)) {
    return { status: "ready", phase: "craft", goalId: goal.id };
  }
  return { status: "gather", phase: "fight-or-trade", goalId: goal.id };
}

// Ladder: empty → wood; wood owned → stone; all owned → null.
assert.equal(getCurrentWeaponGoal([]).id, "wooden-sword");
assert.equal(getCurrentWeaponGoal(["wooden-sword"]).id, "stone-sword");
assert.equal(
  getCurrentWeaponGoal(["wooden-sword", "stone-sword", "iron-sword"]).id,
  "diamond-sword",
);
assert.equal(
  getCurrentWeaponGoal([
    "wooden-sword",
    "stone-sword",
    "iron-sword",
    "diamond-sword",
  ]),
  null,
);
assert.equal(
  getEquippedWeapon(["wooden-sword", "iron-sword"]).id,
  "iron-sword",
);

const emptyRes = { wood: 0, stone: 0, iron: 0, diamond: 0, emerald: 0, glass: 0, wool: 0 };
assert.equal(snapshotStatus([], emptyRes).status, "gather");
assert.equal(
  snapshotStatus([], { ...emptyRes, wood: 3 }).status,
  "ready",
  "3 wood unlocks wood craft CTA",
);

const allWeapons = [
  "wooden-sword",
  "stone-sword",
  "iron-sword",
  "diamond-sword",
];
const emptyHome = snapshotStatus(allWeapons, emptyRes, {});
assert.equal(emptyHome.phase, "decorate-home");
assert.equal(emptyHome.homeFill.empty, 10);
assert.ok(
  emptyHome.homeFill.empty > 0,
  "after diamond, empty home still pushes decorate",
);

const fullHome = Object.fromEntries(HOME_ROOM_SLOTS.map((s) => [s, "plank"]));
const afterHome = snapshotStatus(allWeapons, emptyRes, fullHome);
assert.equal(afterHome.phase, "weekly", "full home selects weekly challenge");
assert.equal(afterHome.homeFill.empty, 0);
assert.ok(afterHome.weeklyId, "weekly id present");
assert.ok(
  ["fight", "trade", "home"].includes(afterHome.ctaKind),
  "weekly CTA stays on speak loop",
);
assert.notEqual(afterHome.ctaKind, "quest", "no quiz-island CTA after home");

// Weekly rotation must not collapse to limp「回我家看看」-only.
const limpOnly = ["回我家看看", "Visit home"];
assert.ok(!limpOnly.includes(afterHome.weeklyId));
assert.ok(WEEKLY_ROTATION.length >= 3);
assert.ok(WEEKLY_ROTATION.some((c) => c.kind === "zone-monster"));
assert.ok(WEEKLY_ROTATION.some((c) => c.kind === "villager-chat"));
assert.ok(WEEKLY_ROTATION.some((c) => c.kind === "light-decor"));

console.log("MW-62 weapon-goal smoke OK", {
  earlyGoal: getCurrentWeaponGoal([]).id,
  afterHome: { weeklyId: afterHome.weeklyId, ctaKind: afterHome.ctaKind },
});
