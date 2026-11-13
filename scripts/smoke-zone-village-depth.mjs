/**
 * MW-58 smoke: zone/village content depth (P1-2).
 * Run: node scripts/smoke-zone-village-depth.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

const exploreZones = read("src/data/exploreZones.ts");
const monsterDrops = read("src/data/monsterDrops.ts");
const decoSpeak = read("src/data/decorationSpeak.ts");
const weekly = read("src/lib/weeklyChallenge.ts");
const picker = read("src/components/ExploreZonePicker.tsx");
const trade = read("src/components/TradePageClient.tsx");
const mapCard = read("src/components/MapZoneCard.tsx");
const mapZones = read("src/data/mapZones.ts");
const css = read("src/styles/globals.css");

assert.match(
  exploreZones,
  /wildMonsterIds: \["zombie", "spider", "wolf", "sheep", "pig"\]/,
  "forest includes pig",
);
assert.match(monsterDrops, /"pig"/, "pig in WILD_MONSTER_WORD_IDS");
assert.match(monsterDrops, /pig: \[/, "pig fixed drops");

assert.match(
  decoSpeak,
  /pig:[\s\S]*craft[\s\S]*plank[\s\S]*stick/,
  "pig → crafting-corner words",
);
assert.match(
  decoSpeak,
  /skeleton:[\s\S]*learnWordIds: \["chest"\]/,
  "skeleton → chest",
);
assert.match(
  decoSpeak,
  /creeper:[\s\S]*redstone[\s\S]*button[\s\S]*door/,
  "creeper → redstone lamp words",
);

assert.match(weekly, /id: "pig-craft"/, "weekly pig challenge");
assert.match(weekly, /monsterId: "pig"/, "weekly targets pig");

assert.match(picker, /mw-explore-portal-village/, "village explore portal");
assert.match(picker, /href="\/trade"/, "village portal → /trade");
assert.match(picker, /去找村民/, "Hub-aligned village CTA");
assert.match(picker, /找村民 · 深聊再开口交易/, "village blurb");

assert.doesNotMatch(
  picker,
  /GuideQuiz|\/quests|选择题/,
  "explore picker stays off quiz islands",
);

assert.match(trade, /出门到村/, "trade page village spatial copy");
assert.match(trade, /找村民/, "trade page Hub villager language");
assert.match(mapCard, /去村庄找村民/, "map village CTA aligned");
assert.match(mapZones, /出门到村找村民/, "map zone village description");
assert.match(css, /mw-explore-portal-village/, "village portal tone");

console.log("smoke-zone-village-depth: ok");
