/**
 * MW-59 smoke: local multi-slot key family + progress summary math.
 * Run: node scripts/smoke-save-slots.mjs
 */
import assert from "node:assert/strict";

const GAME_STATE_STORAGE_KEY = "minewords-game-state";
const SAVE_SLOTS_META_KEY = "minewords-save-slots";
const SAVE_SLOT_IDS = ["1", "2", "3"];

function slotSnapshotStorageKey(slotId) {
  return `${GAME_STATE_STORAGE_KEY}__slot_${slotId}`;
}

function summarizeProgress(state) {
  const xp = typeof state?.xp === "number" && Number.isFinite(state.xp) ? state.xp : 0;
  const level = Math.floor(xp / 100) + 1;
  const playerName =
    typeof state?.playerName === "string" && state.playerName.trim().length > 0
      ? state.playerName.trim().slice(0, 24)
      : "Alex";
  const unlockedIds = Array.isArray(state?.unlockedIds) ? state.unlockedIds : [];
  const weaponOrder = [
    "wooden-sword",
    "stone-sword",
    "iron-sword",
    "diamond-sword",
  ];
  const weaponLabels = {
    "wooden-sword": "木剑",
    "stone-sword": "石剑",
    "iron-sword": "铁剑",
    "diamond-sword": "钻石剑",
  };
  let weaponLabelCn = "尚未挂剑";
  for (const id of weaponOrder) {
    if (unlockedIds.includes(id)) weaponLabelCn = weaponLabels[id];
  }
  const homeSlots = [
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
  const roomBlocks = state?.roomBlocks ?? {};
  const homeFilled = homeSlots.filter((slot) => Boolean(roomBlocks[slot])).length;
  return {
    playerName,
    level,
    weaponLabelCn,
    homeFillLabelCn: `${homeFilled}/${homeSlots.length}`,
  };
}

assert.equal(SAVE_SLOTS_META_KEY.startsWith("minewords-"), true);
assert.equal(SAVE_SLOT_IDS.length, 3);
assert.equal(
  slotSnapshotStorageKey("2"),
  "minewords-game-state__slot_2",
  "inactive shelves stay in the same key family",
);
assert.equal(
  slotSnapshotStorageKey("1").startsWith(GAME_STATE_STORAGE_KEY),
  true,
);

const empty = summarizeProgress({});
assert.equal(empty.playerName, "Alex");
assert.equal(empty.level, 1);
assert.equal(empty.weaponLabelCn, "尚未挂剑");
assert.equal(empty.homeFillLabelCn, "0/10");

const mid = summarizeProgress({
  playerName: "小明",
  xp: 250,
  unlockedIds: ["wooden-sword", "stone-sword"],
  roomBlocks: { "floor-0": "plank", "wall-1": "wool" },
});
assert.equal(mid.playerName, "小明");
assert.equal(mid.level, 3);
assert.equal(mid.weaponLabelCn, "石剑");
assert.equal(mid.homeFillLabelCn, "2/10");

console.log("MW-59 smoke OK", {
  metaKey: SAVE_SLOTS_META_KEY,
  activeKey: GAME_STATE_STORAGE_KEY,
  shelfExample: slotSnapshotStorageKey("2"),
  summary: mid,
});
