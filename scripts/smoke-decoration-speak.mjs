/**
 * MW-57 smoke: decoration words on fight/trade speak surfaces.
 * Run: node scripts/smoke-decoration-speak.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

const decoSpeak = read("src/data/decorationSpeak.ts");
const monsterDrops = read("src/data/monsterDrops.ts");
const attackSpeech = read("src/lib/attackSpeech.ts");
const trades = read("src/data/trades.ts");
const villagerChat = read("src/data/villagerChat.ts");
const weaponGoal = read("src/lib/weaponGoal.ts");
const hubRoom = read("src/components/HubRoom.tsx");

assert.match(decoSpeak, /MONSTER_DECOR_SPEAK/, "decor speak map exists");
assert.match(decoSpeak, /wolf:[\s\S]*tame[\s\S]*friend/, "forest wolf → tame/friend");
assert.match(decoSpeak, /witch:[\s\S]*torch[\s\S]*light/, "cave witch → torch/light");
assert.match(
  decoSpeak,
  /enderman:[\s\S]*portal[\s\S]*obsidian/,
  "mines enderman → portal/obsidian",
);
assert.match(decoSpeak, /blaze:[\s\S]*nether/, "mines blaze → nether");
assert.match(
  decoSpeak,
  /dragon:[\s\S]*enchant[\s\S]*book/,
  "crystal dragon → enchant/book",
);
assert.match(
  decoSpeak,
  /pig:[\s\S]*craft[\s\S]*plank[\s\S]*stick/,
  "forest pig → craft/plank/stick",
);
assert.match(
  decoSpeak,
  /sheep:[\s\S]*shears[\s\S]*wool/,
  "forest sheep → shears/wool (MW-67)",
);
assert.match(
  decoSpeak,
  /cat:[\s\S]*tame[\s\S]*friend/,
  "forest cat → tame/friend (MW-67)",
);
assert.match(
  decoSpeak,
  /skeleton:[\s\S]*chest/,
  "cave skeleton → chest",
);
assert.match(
  decoSpeak,
  /creeper:[\s\S]*redstone[\s\S]*button[\s\S]*door/,
  "mines creeper → redstone/button/door",
);

assert.match(
  monsterDrops,
  /MONSTER_DECOR_SPEAK/,
  "bonus learn built from decor speak",
);
assert.match(
  attackSpeech,
  /getDecorSpeakRungOverride/,
  "attack ladder applies decor weaves",
);

assert.match(trades, /boat-for-ocean/, "trade offer for ocean dock words");
assert.match(trades, /bed-to-sleep/, "trade offer for bed words");
assert.match(trades, /wordIds: \["boat", "ocean", "swim"\]/, "boat wordIds");
assert.match(trades, /wordIds: \["bed", "sleep"\]/, "bed wordIds");

assert.match(villagerChat, /villager-farm/, "villager farm deep-chat beat");
assert.match(
  villagerChat,
  /wordIds: \["farm", "wheat", "carrot"\]/,
  "farm wordIds",
);

assert.match(weaponGoal, /再点亮 1 个家装/, "post-weekly decor nudge");
assert.match(hubRoom, /mw-deco-lit-toast/, "hub celebrate toast");
assert.match(hubRoom, /点亮了/, "toast copy");
assert.match(hubRoom, /playGameSfx\("decor"\)/, "Ship E decor sfx");
assert.match(hubRoom, /mw-weapon-goal-strip-celebrate/, "Ship E goal-bar celebrate");

console.log("smoke-decoration-speak: ok");
