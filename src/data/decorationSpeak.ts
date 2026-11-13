/**
 * MW-57 / P1-1 — decoration-required words on the fight / trade speak surface.
 *
 * Base decorations unlock from learned words, but many required ids never
 * appeared in wild prompts or villager lines. This map weaves 1–2 words per
 * zone into monster phrase/sentence rungs (word rung stays the mob name) and
 * marks them learned on first defeat via MONSTER_BONUS_LEARN_WORD_IDS.
 */

export type DecorSpeakWeave = {
  /** Zone this weave serves (audit / blurbs). */
  zoneId: "forest" | "cave" | "mines" | "crystal";
  /** Marked learned on first defeat (same contract as sheep → wool). */
  learnWordIds: readonly string[];
  /** Phrase + sentence overrides; word rung stays the monster name. */
  phrase: {
    expectedText: string;
    keywords: string[];
    hintCn: string;
    hintEn: string;
  };
  sentence: {
    expectedText: string;
    keywords: string[];
    hintCn: string;
    hintEn: string;
  };
};

/**
 * Per-monster speak weaves (thinnest decoration gaps first).
 * Forest wolf → dog house · cave witch → torch · mines enderman/blaze → portal
 * frame · crystal dragon → enchant table (diamond already on trade/crystal drops).
 */
export const MONSTER_DECOR_SPEAK: Partial<Record<string, DecorSpeakWeave>> = {
  wolf: {
    zoneId: "forest",
    learnWordIds: ["tame", "friend"],
    phrase: {
      expectedText: "Tame wolf",
      keywords: ["tame", "wolf"],
      hintCn: "说短句：Tame wolf",
      hintEn: "Say a short phrase: Tame wolf",
    },
    sentence: {
      expectedText: "I tame the wolf as a friend",
      keywords: ["tame", "wolf", "friend"],
      hintCn: "说完整句：I tame the wolf as a friend",
      hintEn: "Say a full sentence: I tame the wolf as a friend",
    },
  },
  witch: {
    zoneId: "cave",
    learnWordIds: ["torch", "light"],
    phrase: {
      expectedText: "Torch witch",
      keywords: ["torch", "witch"],
      hintCn: "说短句：Torch witch",
      hintEn: "Say a short phrase: Torch witch",
    },
    sentence: {
      expectedText: "I light the witch with a torch",
      keywords: ["light", "witch", "torch"],
      hintCn: "说完整句：I light the witch with a torch",
      hintEn: "Say a full sentence: I light the witch with a torch",
    },
  },
  enderman: {
    zoneId: "mines",
    learnWordIds: ["portal", "obsidian"],
    phrase: {
      expectedText: "Portal enderman",
      keywords: ["portal", "enderman"],
      hintCn: "说短句：Portal enderman",
      hintEn: "Say a short phrase: Portal enderman",
    },
    sentence: {
      expectedText: "I attack the enderman near obsidian",
      keywords: ["attack", "enderman", "obsidian"],
      hintCn: "说完整句：I attack the enderman near obsidian",
      hintEn: "Say a full sentence: I attack the enderman near obsidian",
    },
  },
  blaze: {
    zoneId: "mines",
    learnWordIds: ["nether"],
    phrase: {
      expectedText: "Nether blaze",
      keywords: ["nether", "blaze"],
      hintCn: "说短句：Nether blaze",
      hintEn: "Say a short phrase: Nether blaze",
    },
    sentence: {
      expectedText: "I attack the blaze in the nether",
      keywords: ["attack", "blaze", "nether"],
      hintCn: "说完整句：I attack the blaze in the nether",
      hintEn: "Say a full sentence: I attack the blaze in the nether",
    },
  },
  dragon: {
    zoneId: "crystal",
    learnWordIds: ["enchant", "book"],
    phrase: {
      expectedText: "Enchant dragon",
      keywords: ["enchant", "dragon"],
      hintCn: "说短句：Enchant dragon",
      hintEn: "Say a short phrase: Enchant dragon",
    },
    sentence: {
      expectedText: "I enchant the dragon with a book",
      keywords: ["enchant", "dragon", "book"],
      hintCn: "说完整句：I enchant the dragon with a book",
      hintEn: "Say a full sentence: I enchant the dragon with a book",
    },
  },
};

/** Bonus learn ids to merge into monsterDrops (includes sheep → wool). */
export function getDecorBonusLearnWordIds(
  wordId: string,
): readonly string[] {
  return MONSTER_DECOR_SPEAK[wordId]?.learnWordIds ?? [];
}

export function getDecorSpeakWeave(
  wordId: string,
): DecorSpeakWeave | undefined {
  return MONSTER_DECOR_SPEAK[wordId];
}

export function getDecorSpeakRungOverride(
  wordId: string,
  rung: "word" | "phrase" | "sentence",
): DecorSpeakWeave["phrase"] | DecorSpeakWeave["sentence"] | undefined {
  const weave = MONSTER_DECOR_SPEAK[wordId];
  if (!weave || rung === "word") return undefined;
  return rung === "phrase" ? weave.phrase : weave.sentence;
}
