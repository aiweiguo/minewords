/**
 * MW-67 / Ship C smoke: cow/chicken into speak loop; slime/cat/shears only if wired.
 * Run: node scripts/smoke-ship-c-speak-vocab.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

const monsterDrops = read("src/data/monsterDrops.ts");
const exploreZones = read("src/data/exploreZones.ts");
const decoSpeak = read("src/data/decorationSpeak.ts");
const vocabulary = read("src/data/vocabulary.ts");
const crafting = read("src/data/crafting.ts");
const materialPlans = read("src/data/materialPlans.ts");
const weekly = read("src/lib/weeklyChallenge.ts");
const zoneDrops = read("src/lib/exploreZones.ts");
const wrongWord = read("src/lib/wrongWord.ts");

// --- Existing vocab pulled into fight (no new cow/chicken encyclopedia rows) ---
assert.match(monsterDrops, /"cow"/, "cow in WILD_MONSTER_WORD_IDS");
assert.match(monsterDrops, /"chicken"/, "chicken in WILD_MONSTER_WORD_IDS");
assert.match(
  monsterDrops,
  /cow:\s*\[["']beef["'],\s*["']leather["']\]/,
  "cow bonus learn beef/leather",
);
assert.match(
  monsterDrops,
  /chicken:\s*\[["']egg["']\]/,
  "chicken bonus learn egg",
);
assert.match(monsterDrops, /cow: \[[\s\S]*resource[\s\S]*wood/, "cow fixed drops");
assert.match(
  monsterDrops,
  /chicken: \[[\s\S]*resource[\s\S]*wood/,
  "chicken fixed drops",
);

assert.match(exploreZones, /"cow"/, "forest lists cow");
assert.match(exploreZones, /"chicken"/, "forest lists chicken");
assert.match(
  exploreZones,
  /wildMonsterIds: \[[\s\S]*"cow"[\s\S]*"chicken"[\s\S]*"cat"/,
  "forest wild pool includes cow/chicken/cat",
);

// --- New words only when wired into wild or craft/decor speak ---
assert.match(monsterDrops, /"slime"/, "slime in WILD_MONSTER_WORD_IDS");
assert.match(monsterDrops, /"cat"/, "cat in WILD_MONSTER_WORD_IDS");
assert.match(exploreZones, /"slime"/, "cave lists slime");
assert.match(
  decoSpeak,
  /cat:[\s\S]*tame[\s\S]*friend/,
  "cat → tame/friend home track",
);
assert.match(
  decoSpeak,
  /sheep:[\s\S]*shears[\s\S]*wool/,
  "sheep → shears/wool speak weave",
);

assert.match(vocabulary, /id: "slime"/, "slime vocab row (speak-wired)");
assert.match(vocabulary, /id: "cat"/, "cat vocab row (speak-wired)");
assert.match(vocabulary, /id: "shears"/, "shears vocab row (craft-wired)");

assert.match(crafting, /id: "shears"/, "shears craft recipe");
assert.match(
  crafting,
  /keywordIds: \["shears", "iron", "sheep", "wool"\]/,
  "shears craft keywords",
);
assert.match(
  crafting,
  /keywordIds: \["wool", "plank", "bed", "sleep", "shears"\]/,
  "bed craft mentions shears",
);
assert.match(
  materialPlans,
  /keywordIds: \["wool", "plank", "bed", "sleep", "shears"\]/,
  "bed material plan mentions shears",
);

assert.match(weekly, /id: "cow-beef"/, "weekly cow challenge");
assert.match(weekly, /monsterId: "cow"/, "weekly targets cow");
assert.match(weekly, /id: "slime-cave"/, "weekly slime challenge");
assert.match(weekly, /monsterId: "slime"/, "weekly targets slime");

assert.match(
  zoneDrops,
  /wordId === "sheep"[\s\S]*wool/,
  "forest sheep zone bias keeps wool",
);
assert.match(wrongWord, /cow: "🐄"/, "cow emoji");
assert.match(wrongWord, /chicken: "🐔"/, "chicken emoji");
assert.match(wrongWord, /slime:/, "slime emoji");
assert.match(wrongWord, /cat:/, "cat emoji");

// Hard excludes for this ship
assert.doesNotMatch(vocabulary, /id: "cobblestone"/, "no cobblestone encyclopedia");
assert.doesNotMatch(vocabulary, /id: "ghast"/, "no ghast");
assert.doesNotMatch(vocabulary, /id: "cookie"/, "no cookie");
assert.doesNotMatch(vocabulary, /id: "cake"/, "no cake");
assert.doesNotMatch(vocabulary, /id: "netherite"/, "no netherite");
assert.doesNotMatch(
  monsterDrops,
  /"golem"|"iron.goolem"/,
  "no iron golem in wild pool",
);

console.log("smoke-ship-c-speak-vocab: ok");
