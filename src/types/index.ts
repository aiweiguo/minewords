export type VocabularyCategory =
  | "block"
  | "tool"
  | "weapon"
  | "mob"
  | "food"
  | "ore"
  | "armor"
  | "crafting"
  | "biome"
  | "action";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type VocabularyItem = {
  id: string;
  minecraftKey?: string;
  english: string;
  chinese: string;
  phonetic?: string;
  category: VocabularyCategory;
  difficulty: 1 | 2 | 3;
  icon?: string;
  image?: string;
  rarity?: Rarity;
  words?: {
    word: string;
    phonetic?: string;
    chinese: string;
  }[];
  example: string;
  exampleCn: string;
  tags: string[];
};

export type MapArea = "forest" | "cave" | "village" | "nether" | "end" | "battle";

export type WordChoiceStep = {
  id: string;
  type: "word-choice";
  prompt: string;
  options: string[];
  answer: string;
  explanation?: string;
};

export type ListeningStep = {
  id: string;
  type: "word-listening";
  speakText: string;
  prompt: string;
  options: string[];
  answer: string;
};

export type CraftingStep = {
  id: string;
  type: "crafting";
  prompt: string;
  requiredWords: string[];
  options: string[];
  answer: string;
};

export type QuestStep = WordChoiceStep | ListeningStep | CraftingStep;

export type ResourceType =
  | "wood"
  | "stone"
  | "iron"
  | "gold"
  | "emerald"
  | "diamond"
  | "netherite";

export type Reward = {
  type: "resource" | "xp" | "unlock";
  resource?: ResourceType;
  amount?: number;
  xp?: number;
  unlockId?: string;
};

/** Short material errand tied to the current weapon goal (MW-8). */
export type ErrandGoal =
  | {
      type: "defeat-monsters";
      /** How many speak-attack fights to finish the errand. */
      amount: number;
      /** Preferred drop / zone focus (wood, stone, …). */
      resource?: ResourceType;
    }
  | {
      type: "gather-resource";
      resource: ResourceType;
      amount: number;
    }
  | {
      type: "craft-weapon";
      weaponId: string;
    };

export type MaterialErrand = {
  /** Weapon tier this errand feeds (wooden-sword, stone-sword, …). */
  weaponId: string;
  goal: ErrandGoal;
  /** After claim, nudge back into the craft / explore loop. */
  nudge: "explore" | "craft";
  /** Explore zone hint for fight errands. */
  exploreZoneId?: "forest" | "cave";
};

export type Quest = {
  id: string;
  title: string;
  titleCn: string;
  description: string;
  /** Kid-facing Chinese summary (errands prefer this). */
  descriptionCn?: string;
  mapArea: MapArea;
  difficulty: 1 | 2 | 3;
  requiredLevel: number;
  coverImage?: string;
  icon?: string;
  themeColor?: string;
  /**
   * Legacy quiz steps. Material errands leave this empty and use `errand`.
   * Guides / listening still reuse QuestStep shapes elsewhere.
   */
  steps: QuestStep[];
  rewards: Reward[];
  unlocks?: string[];
  /** When set, /quests treats this as a material errand (not a quiz). */
  errand?: MaterialErrand;
};

export type UnlockableType = "equipment" | "title" | "map" | "decoration";

export type Unlockable = {
  id: string;
  type: UnlockableType;
  name: string;
  nameCn: string;
  description: string;
  icon: string;
  image?: string;
  rarity?: Rarity;
  questId?: string;
  requiredWordIds?: string[];
  requiredCount?: number;
};

export type DailyStats = {
  date: string;
  completedQuests: number;
  buildIdeasClaimed: number;
  adventuresCompleted: number;
  correctAnswers: number;
  learnedWords: number;
  masteredTodayIds: string[];
  dailyAdventureCompleted: boolean;
  dailyAdventureId: string;
  speakAttempts: number;
};

/** Placeable block kinds in the side-view home room (MC-inspired, not official assets). */
export type RoomBlockType = "plank" | "cobble";

/** Side-view room slots: floor row + lower wall row. */
export type RoomSlotId =
  | "floor-0"
  | "floor-1"
  | "floor-2"
  | "floor-3"
  | "floor-4"
  | "floor-5"
  | "wall-0"
  | "wall-1"
  | "wall-2"
  | "wall-3";

export type RoomBlocks = Partial<Record<RoomSlotId, RoomBlockType>>;

export type GameState = {
  playerName: string;
  xp: number;
  resources: Record<ResourceType, number>;
  /** Placed blocks in the home hub room (persisted). */
  roomBlocks: RoomBlocks;
  /** Last chosen weapon-tier explore zone (forest / cave). */
  selectedExploreZoneId: string | null;
  completedQuestIds: string[];
  /** Progress counters for material errands (fight counts, gathered units). */
  errandProgress: Record<string, number>;
  unlockedIds: string[];
  masteredWordIds: string[];
  discoveredWordIds: string[];
  learnedWordIds: string[];
  completedGuideIds: string[];
  completedBuildIdeaIds: string[];
  completedSpeakIds: string[];
  wrongWordCounts: Record<string, number>;
  defeatedMonsterIds: string[];
  learningStreak: number;
  lastActiveDate: string;
  dailyStats: DailyStats;
  hasSeenOnboarding: boolean;
};

export type RewardResult = {
  rewards: Reward[];
  unlocks: string[];
  isFirstCompletion: boolean;
};

export type QuestStatus = "locked" | "available" | "completed";

export type MineDexStatus = "undiscovered" | "discovered" | "learned" | "mastered";

export type GuideCategory =
  | "survival"
  | "tools"
  | "mobs"
  | "exploration"
  | "crafting"
  | "redstone";

export type GuideMaterial = {
  english: string;
  chinese: string;
  amount?: string;
};

export type GuideStep = {
  cn: string;
  en: string;
};

export type GuideKeyword = {
  wordId: string;
  english: string;
  chinese: string;
};

export type Guide = {
  id: string;
  title: string;
  titleCn: string;
  category: GuideCategory;
  difficulty: 1 | 2 | 3;
  summaryCn: string;
  simpleEnglish: string;
  materials: GuideMaterial[];
  steps: GuideStep[];
  keywords: GuideKeyword[];
  quizSteps: QuestStep[];
  relatedQuestId?: string;
  icon?: string;
};

export type BuildIdeaCategory =
  | "house"
  | "farm"
  | "redstone"
  | "adventure"
  | "decoration";

export type BuildIdea = {
  id: string;
  title: string;
  titleCn: string;
  category: BuildIdeaCategory;
  descriptionCn: string;
  missionEn: string[];
  materials: GuideMaterial[];
  keywords: GuideKeyword[];
  rewards: Reward[];
  icon?: string;
};

export type CraftingSlot = {
  itemId: string;
  english: string;
  chinese: string;
};

export type CraftingRecipe = {
  id: string;
  resultEnglish: string;
  resultChinese: string;
  resultWordId: string;
  grid: (CraftingSlot | null)[][];
  simpleEnglish: string;
  simpleChinese: string;
  keywordIds: string[];
  relatedGuideId?: string;
  relatedQuestId?: string;
};

export type DailyAdventurePlan = {
  id: string;
  title: string;
  titleCn: string;
  descriptionCn: string;
  wordIds: string[];
  questId?: string;
  guideId?: string;
  rewards: Reward[];
};

export type MaterialPlanItem = {
  itemId: string;
  english: string;
  chinese: string;
  amount: number;
};

export type MaterialPlan = {
  id: string;
  title: string;
  titleCn: string;
  descriptionCn: string;
  simpleEnglish: string;
  items: MaterialPlanItem[];
  keywordIds: string[];
  queryAliases?: string[];
};

export type SentencePattern = {
  id: string;
  patternEn: string;
  patternCn: string;
  examples: {
    english: string;
    chinese: string;
    wordIds: string[];
  }[];
};

export type MapZone = {
  id: string;
  mapArea: MapArea;
  name: string;
  nameCn: string;
  emoji: string;
  requiredLevel: number;
  questIds: string[];
  descriptionCn: string;
};

export type SpeakRole = "steve" | "alex" | "villager";

export type SpeakScenario = {
  id: string;
  role: SpeakRole;
  title: string;
  titleCn: string;
  npcLine: string;
  npcLineCn: string;
  expectedText: string;
  keywords: string[];
  hintCn: string;
  rewardXp: number;
};

export type BaseDecoration = {
  id: string;
  name: string;
  nameCn: string;
  emoji: string;
  description: string;
  requiredWordIds: string[];
  requiredCount: number;
};
