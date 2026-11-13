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
 * Forest wolf → dog house · forest pig → crafting corner · cave witch → torch ·
 * cave skeleton → chest · mines enderman/blaze → portal · mines creeper → redstone
 * lamp · crystal dragon → enchant table (diamond already on trade/crystal drops).
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
  // MW-58: forest pig → deco-crafting (craft / plank / stick).
  pig: {
    zoneId: "forest",
    learnWordIds: ["craft", "plank", "stick"],
    phrase: {
      expectedText: "Craft stick",
      keywords: ["craft", "stick", "plank", "pig"],
      hintCn: "说短句：Craft stick",
      hintEn: "Say a short phrase: Craft stick",
    },
    sentence: {
      expectedText: "I craft a plank stick near the pig",
      keywords: ["craft", "plank", "stick", "pig"],
      hintCn: "说完整句：I craft a plank stick near the pig",
      hintEn: "Say a full sentence: I craft a plank stick near the pig",
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
  // MW-58: cave skeleton → deco-chest (chest; craft also from pig).
  skeleton: {
    zoneId: "cave",
    learnWordIds: ["chest"],
    phrase: {
      expectedText: "Chest skeleton",
      keywords: ["chest", "skeleton"],
      hintCn: "说短句：Chest skeleton",
      hintEn: "Say a short phrase: Chest skeleton",
    },
    sentence: {
      expectedText: "I open the chest near the skeleton",
      keywords: ["chest", "skeleton", "open"],
      hintCn: "说完整句：I open the chest near the skeleton",
      hintEn: "Say a full sentence: I open the chest near the skeleton",
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
  // MW-58: mines creeper → deco-redstone (redstone / button / door).
  creeper: {
    zoneId: "mines",
    learnWordIds: ["redstone", "button", "door"],
    phrase: {
      expectedText: "Redstone creeper",
      keywords: ["redstone", "creeper"],
      hintCn: "说短句：Redstone creeper",
      hintEn: "Say a short phrase: Redstone creeper",
    },
    sentence: {
      expectedText: "I fight the creeper by the redstone door",
      keywords: ["fight", "creeper", "redstone", "door", "button"],
      hintCn: "说完整句：I fight the creeper by the redstone door",
      hintEn: "Say a full sentence: I fight the creeper by the redstone door",
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
