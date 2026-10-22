import { getVocabularyById } from "@/data/vocabulary";
import { Reward, ResourceType } from "@/types";

/** Starter wild encounters kids can fight without wrong-word spawns. */
export const WILD_MONSTER_WORD_IDS = [
  "zombie",
  "spider",
  "skeleton",
  "creeper",
] as const;

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
  skeleton: [
    { type: "resource", resource: "stone", amount: 3 },
    { type: "resource", resource: "iron", amount: 1 },
    { type: "xp", xp: 12 },
  ],
  creeper: [
    { type: "resource", resource: "iron", amount: 2 },
    { type: "resource", resource: "emerald", amount: 1 },
    { type: "xp", xp: 15 },
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
    { resource: "gold", amount: 1 },
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
