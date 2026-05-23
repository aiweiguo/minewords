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

export type VocabularyItem = {
  id: string;
  minecraftKey?: string;
  english: string;
  chinese: string;
  phonetic?: string;
  category: VocabularyCategory;
  difficulty: 1 | 2 | 3;
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
  steps: QuestStep[];
  rewards: Reward[];
  unlocks?: string[];
};

export type UnlockableType = "equipment" | "title" | "map";

export type Unlockable = {
  id: string;
  type: UnlockableType;
  name: string;
  nameCn: string;
  description: string;
  icon: string;
  questId?: string;
};

export type DailyStats = {
  date: string;
  completedQuests: number;
  correctAnswers: number;
  learnedWords: number;
};

export type GameState = {
  playerName: string;
  xp: number;
  resources: Record<ResourceType, number>;
  completedQuestIds: string[];
  unlockedIds: string[];
  masteredWordIds: string[];
  dailyStats: DailyStats;
};

export type RewardResult = {
  rewards: Reward[];
  unlocks: string[];
  isFirstCompletion: boolean;
};

export type QuestStatus = "locked" | "available" | "completed";
