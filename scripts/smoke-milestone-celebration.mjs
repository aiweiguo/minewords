/**
 * MW-60 smoke: once-per-milestone celebration pending + handoff copy.
 * Mirrors src/lib/milestoneCelebration.ts (no bundler).
 * Run: node scripts/smoke-milestone-celebration.mjs
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

function getHomeFillProgress(roomBlocks = {}) {
  const total = HOME_SLOTS.length;
  const filled = HOME_SLOTS.filter((slot) => Boolean(roomBlocks[slot])).length;
  return { filled, total, empty: Math.max(0, total - filled) };
}

function getPendingMilestoneCelebration(unlockedIds, roomBlocks, seen) {
  const hasDiamond = unlockedIds.includes("diamond-sword");
  if (!hasDiamond) return null;
  if (!seen.diamondLine) return "diamondLine";
  const home = getHomeFillProgress(roomBlocks);
  if (home.empty === 0 && !seen.homeFull) return "homeFull";
  return null;
}

assert.equal(
  getPendingMilestoneCelebration([], {}, {}),
  null,
  "no diamond → no celebration",
);

assert.equal(
  getPendingMilestoneCelebration(["diamond-sword"], {}, {}),
  "diamondLine",
  "diamond unlock → diamond celebration",
);

assert.equal(
  getPendingMilestoneCelebration(
    ["diamond-sword"],
    {},
    { diamondLine: true },
  ),
  null,
  "diamond seen + home empty → wait for home fill",
);

const fullHome = Object.fromEntries(HOME_SLOTS.map((s) => [s, "plank"]));
assert.equal(getHomeFillProgress(fullHome).empty, 0, "full home empty=0");

assert.equal(
  getPendingMilestoneCelebration(
    ["diamond-sword"],
    fullHome,
    { diamondLine: true },
  ),
  "homeFull",
  "home full after diamond seen → home celebration",
);

assert.equal(
  getPendingMilestoneCelebration(
    ["diamond-sword"],
    fullHome,
    { diamondLine: true, homeFull: true },
  ),
  null,
  "both seen → never again",
);

assert.equal(
  getPendingMilestoneCelebration(
    ["diamond-sword"],
    fullHome,
    {},
  ),
  "diamondLine",
  "natural order: diamond before home even if home already full",
);

console.log("smoke-milestone-celebration: ok");
