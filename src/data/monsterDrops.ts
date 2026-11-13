import { MONSTER_DECOR_SPEAK } from "@/data/decorationSpeak";
import { getVocabularyById } from "@/data/vocabulary";
import { Reward, ResourceType } from "@/types";

/** Starter wild encounters kids can fight without wrong-word spawns. */
export const WILD_MONSTER_WORD_IDS = [
  "zombie",
  "spider",
  "skeleton",
  "creeper",
  "blaze",
  "wolf",
  "witch",
  "enderman",
  "crystal",
  // MW-52 / P2-6: existing encyclopedia mobs pulled into the fight loop.
  "sheep",
  "dragon",
  // MW-58 / P1-2: forest pig (crafting-corner decor words; no new dict row).
  "pig",
  // MW-67 / Ship C: existing farm mobs → fight speak + narrative drop words.
  "cow",
  "chicken",
  // MW-67 / Ship C: new speak-serving mobs (wired into wild pool below).
  "slime",
  "cat",
] as const;

function buildMonsterBonusLearnWordIds(): Partial<
  Record<string, readonly string[]>
> {
  const map: Record<string, string[]> = {
    // Sheep → wool feeds hub wool placeable (MW-52 / MW-55).
    // Shears weave also merges in via MONSTER_DECOR_SPEAK (MW-67).
    sheep: ["wool"],
    // MW-67: cow/chicken narrative drops (existing dict rows only).
    cow: ["beef", "leather"],
    chicken: ["egg"],
  };
  for (const [monsterId, weave] of Object.entries(MONSTER_DECOR_SPEAK)) {
    if (!weave) continue;
    map[monsterId] = [...(map[monsterId] ?? []), ...weave.learnWordIds];
  }
  return map;
}

/**
 * Extra dictionary words marked learned on first defeat (still no new vocab rows).
 * MW-57 decor weaves come from `decorationSpeak.ts` (speak-surface prompts).
 */
export const MONSTER_BONUS_LEARN_WORD_IDS = buildMonsterBonusLearnWordIds();

const FIXED_DROPS: Partial<Record<string, Reward[]>> = {
  zombie: [
    { type: "resource", resource: "wood", amount: 3 },
    { type: "resource", resource: "stone", amount: 1 },
    { type: "xp", xp: 10 },
  ],
  spider: [
    { type: "resource", resource: "wood", amount: 2 },
    { type: "xp", xp: 8 },
  ],
  wolf: [
    { type: "resource", resource: "wood", amount: 3 },
    { type: "resource", resource: "stone", amount: 1 },
    { type: "xp", xp: 11 },
  ],
  sheep: [
    // MW-55: wool inventory feeds hub wool placeable (not wood-as-wool).
    { type: "resource", resource: "wool", amount: 2 },
    { type: "resource", resource: "wood", amount: 1 },
    { type: "xp", xp: 9 },
  ],
  pig: [
    // MW-58: wood-biased drops feed forest craft goals + crafting-corner words.
    { type: "resource", resource: "wood", amount: 3 },
    { type: "resource", resource: "stone", amount: 1 },
    { type: "xp", xp: 10 },
  ],
  // MW-67: forest farm animals — wood bias; beef/leather/egg via bonus learn.
  cow: [
    { type: "resource", resource: "wood", amount: 3 },
    { type: "resource", resource: "stone", amount: 1 },
    { type: "xp", xp: 10 },
  ],
  chicken: [
    { type: "resource", resource: "wood", amount: 2 },
    { type: "resource", resource: "stone", amount: 1 },
    { type: "xp", xp: 8 },
  ],
  // MW-67: cute low-tier expand forest/cave speak pool.
  slime: [
    { type: "resource", resource: "wood", amount: 2 },
    { type: "resource", resource: "stone", amount: 1 },
    { type: "xp", xp: 8 },
  ],
  // MW-67: home-track parallel to wolf (tame/friend weave).
  cat: [
    { type: "resource", resource: "wood", amount: 2 },
    { type: "resource", resource: "stone", amount: 1 },
    { type: "xp", xp: 9 },
  ],
  skeleton: [
    { type: "resource", resource: "stone", amount: 3 },
    { type: "resource", resource: "iron", amount: 1 },
    { type: "xp", xp: 12 },
  ],
  creeper: [
    { type: "resource", resource: "iron", amount: 2 },
    { type: "resource", resource: "emerald", amount: 2 },
    { type: "xp", xp: 15 },
  ],
  witch: [
    { type: "resource", resource: "stone", amount: 3 },
    { type: "resource", resource: "emerald", amount: 2 },
    { type: "xp", xp: 14 },
  ],
  blaze: [
    { type: "resource", resource: "iron", amount: 3 },
    { type: "resource", resource: "stone", amount: 1 },
    { type: "resource", resource: "emerald", amount: 1 },
    { type: "xp", xp: 18 },
  ],
  enderman: [
    { type: "resource", resource: "iron", amount: 3 },
    { type: "resource", resource: "emerald", amount: 2 },
    { type: "xp", xp: 20 },
  ],
  crystal: [
    { type: "resource", resource: "diamond", amount: 2 },
    { type: "resource", resource: "iron", amount: 1 },
    { type: "resource", resource: "emerald", amount: 2 },
    // MW-55: glass inventory feeds hub glass placeable.
    { type: "resource", resource: "glass", amount: 1 },
    { type: "xp", xp: 22 },
  ],
  dragon: [
    { type: "resource", resource: "diamond", amount: 3 },
    { type: "resource", resource: "iron", amount: 2 },
    { type: "resource", resource: "emerald", amount: 3 },
    { type: "xp", xp: 28 },
  ],
};

const DIFFICULTY_DROPS: Record<1 | 2 | 3, { resource: ResourceType; amount: number }[]> = {
  1: [{ resource: "wood", amount: 2 }],
  2: [
    { resource: "stone", amount: 2 },
    { resource: "iron", amount: 1 },
  ],
  3: [
    { resource: "iron", amount: 2 },
    // Was gold (MW-47 / P2-1): gold had no goal sink; emerald feeds diamond trade.
    { resource: "emerald", amount: 1 },
  ],
};

/** Crafting materials (+ XP) dropped when a Word Monster is defeated by speak-hit. */
export function getMonsterDropRewards(wordId: string): Reward[] {
  const fixed = FIXED_DROPS[wordId];
  if (fixed) return fixed.map((reward) => ({ ...reward }));

  const word = getVocabularyById(wordId);
  const difficulty = (word?.difficulty ?? 1) as 1 | 2 | 3;
  const materials = DIFFICULTY_DROPS[difficulty];

  return [
    ...materials.map((drop) => ({
      type: "resource" as const,
      resource: drop.resource,
      amount: drop.amount,
    })),
    { type: "xp", xp: 6 + difficulty * 2 },
  ];
}
