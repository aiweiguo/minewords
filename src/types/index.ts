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

export type Quest = {
  id: string;
  title: string;
  titleCn: string;
  description: string;
  mapArea: MapArea;
  difficulty: 1 | 2 | 3;
  requiredLevel: number;
  coverImage?: string;
  icon?: string;
  themeColor?: string;
  steps: QuestStep[];
  rewards: Reward[];
  unlocks?: string[];
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

export type GameState = {
  playerName: string;
  xp: number;
  resources: Record<ResourceType, number>;
  completedQuestIds: string[];
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
