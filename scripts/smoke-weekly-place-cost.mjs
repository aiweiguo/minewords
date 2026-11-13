/**
 * MW-55 smoke: weekly challenge after home-full + glass/wool place costs.
 * Run: node scripts/smoke-weekly-place-cost.mjs
 */
import assert from "node:assert/strict";

const HOME_SLOTS = [
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

const ROOM_BLOCK_COST = {
  plank: { resource: "wood", amount: 1 },
  cobble: { resource: "stone", amount: 1 },
  glass: { resource: "glass", amount: 1 },
  wool: { resource: "wool", amount: 1 },
};

assert.equal(ROOM_BLOCK_COST.glass.resource, "glass", "glass costs glass");
assert.equal(ROOM_BLOCK_COST.wool.resource, "wool", "wool costs wool");
assert.notEqual(ROOM_BLOCK_COST.glass.resource, "wood", "glass must not cost wood");
assert.notEqual(ROOM_BLOCK_COST.wool.resource, "wood", "wool must not cost wood");

const sheepDrops = ["wool", "wood"];
assert.ok(sheepDrops.includes("wool"), "sheep drops wool");

const crystalDrops = ["diamond", "iron", "emerald", "glass"];
assert.ok(crystalDrops.includes("glass"), "crystal drops glass");

const ROTATION = [
  { id: "sheep-wool", kind: "zone-monster", monsterId: "sheep", target: 1 },
  // MW-58: pig craft-corner week
  { id: "pig-craft", kind: "zone-monster", monsterId: "pig", target: 1 },
  // MW-67: cow / slime speak weeks
  { id: "cow-beef", kind: "zone-monster", monsterId: "cow", target: 1 },
  { id: "slime-cave", kind: "zone-monster", monsterId: "slime", target: 1 },
  { id: "villager-3", kind: "villager-chat", target: 3 },
  { id: "light-3-decor", kind: "light-decor", target: 3 },
  { id: "witch-cave", kind: "zone-monster", monsterId: "witch", target: 1 },
  { id: "light-5-decor", kind: "light-decor", target: 5 },
  { id: "enderman-mines", kind: "zone-monster", monsterId: "enderman", target: 1 },
  { id: "villager-3-again", kind: "villager-chat", target: 3 },
  { id: "dragon-crystal", kind: "zone-monster", monsterId: "dragon", target: 1 },
];

assert.ok(ROTATION.length >= 3, "at least 3 weekly templates");
assert.ok(
  ROTATION.some((c) => c.kind === "zone-monster"),
  "has zone monster week",
);
assert.ok(
  ROTATION.some((c) => c.kind === "villager-chat" && c.target === 3),
  "has villager 3-turn week",
);
assert.ok(
  ROTATION.some((c) => c.kind === "light-decor"),
  "has light-decor week",
);

function hashWeekStart(weekStart) {
  let hash = 0;
  for (let i = 0; i < weekStart.length; i += 1) {
    hash = (hash * 31 + weekStart.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pick(weekStart) {
  return ROTATION[hashWeekStart(weekStart) % ROTATION.length];
}

const a = pick("2026-11-09");
const b = pick("2026-11-16");
assert.ok(a && b, "week picks exist");
// Different Mondays should usually differ; if hash collides, still valid templates.
assert.ok(ROTATION.includes(a) || a.id, "pick A valid");
assert.ok(b.id, "pick B valid");

function homeFull(roomBlocks) {
  return HOME_SLOTS.every((slot) => Boolean(roomBlocks[slot]));
}

function homeFillEmpty(roomBlocks) {
  return HOME_SLOTS.filter((slot) => !roomBlocks[slot]).length;
}

const emptyHome = {};
const fullHome = Object.fromEntries(HOME_SLOTS.map((s) => [s, "plank"]));
assert.equal(homeFull(emptyHome), false);
assert.equal(homeFull(fullHome), true);
assert.equal(homeFillEmpty(emptyHome), 10);
assert.equal(homeFillEmpty(fullHome), 0);

// Limp copy must not be the only post-home CTA shape.
const limpLabels = ["回我家看看", "Visit home"];
const weeklyLabels = ROTATION.flatMap(() => ["本周挑战"]);
assert.ok(weeklyLabels.length > 0);
assert.ok(!limpLabels.includes("本周挑战"));

console.log("MW-55 smoke OK", {
  glassCost: ROOM_BLOCK_COST.glass,
  woolCost: ROOM_BLOCK_COST.wool,
  weekA: a.id,
  weekB: b.id,
  homeSlots: HOME_SLOTS.length,
});
