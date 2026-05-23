import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getBuildIdeaById } from "@/data/buildIdeas";
import { getQuestById } from "@/data/quests";
import { XP_PER_CORRECT_ANSWER } from "@/data/rewards";
import { getDecorationUnlockIds } from "@/lib/decorationUnlocks";
import { buildRewardResult } from "@/lib/questEngine";
import {
  DailyStats,
  GameState,
  ResourceType,
  Reward,
  RewardResult,
  DailyAdventurePlan,
} from "@/types";

const defaultResources: Record<ResourceType, number> = {
  wood: 0,
  stone: 0,
  iron: 0,
  gold: 0,
  emerald: 0,
  diamond: 0,
  netherite: 0,
};

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function createDailyStats(): DailyStats {
  return {
    date: getTodayDateString(),
    completedQuests: 0,
    correctAnswers: 0,
    learnedWords: 0,
    dailyAdventureCompleted: false,
    dailyAdventureId: "",
    speakAttempts: 0,
  };
}

function normalizeDailyStats(stats: Partial<DailyStats> | undefined): DailyStats {
  const base = createDailyStats();
  if (stats?.date === getTodayDateString()) {
    return {
      ...base,
      ...stats,
      speakAttempts: stats.speakAttempts ?? 0,
    };
  }
  return base;
}

function touchLearningDay(state: GameState): Pick<GameState, "learningStreak" | "lastActiveDate"> {
  const today = getTodayDateString();
  if (state.lastActiveDate === today) {
    return {
      learningStreak: state.learningStreak,
      lastActiveDate: state.lastActiveDate,
    };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const continued = state.lastActiveDate === yesterdayStr;

  return {
    learningStreak: continued ? state.learningStreak + 1 : 1,
    lastActiveDate: today,
  };
}

function withDecorationSync(state: GameState): Partial<GameState> {
  return {
    unlockedIds: getDecorationUnlockIds(
      state.learnedWordIds,
      state.masteredWordIds,
      state.unlockedIds,
    ),
  };
}

function migrateSpeakIds(saved: Partial<GameState>): {
  completedSpeakIds: string[];
  completedBuildIdeaIds: string[];
} {
  const buildIds = saved.completedBuildIdeaIds ?? [];
  const speakFromBuild = buildIds
    .filter((id) => id.startsWith("speak-"))
    .map((id) => id.replace(/^speak-/, ""));
  const completedSpeakIds = [...new Set([...(saved.completedSpeakIds ?? []), ...speakFromBuild])];
  const completedBuildIdeaIds = buildIds.filter((id) => !id.startsWith("speak-"));

  return { completedSpeakIds, completedBuildIdeaIds };
}

const initialState: GameState = {
  playerName: "Alex",
  xp: 0,
  resources: { ...defaultResources },
  completedQuestIds: [],
  unlockedIds: [],
  masteredWordIds: [],
  discoveredWordIds: [],
  learnedWordIds: [],
  completedGuideIds: [],
  completedBuildIdeaIds: [],
  completedSpeakIds: [],
  wrongWordCounts: {},
  defeatedMonsterIds: [],
  learningStreak: 0,
  lastActiveDate: "",
  dailyStats: createDailyStats(),
};

type GameStore = GameState & {
  addXp: (amount: number) => void;
  addResource: (resource: ResourceType, amount: number) => void;
  unlockItem: (unlockId: string) => void;
  discoverWord: (wordId: string) => void;
  markWordLearned: (wordId: string) => void;
  markWordMastered: (wordId: string) => void;
  completeQuest: (questId: string) => RewardResult | null;
  completeGuide: (guideId: string, keywordIds?: string[]) => boolean;
  claimBuildIdea: (ideaId: string) => boolean;
  completeDailyAdventure: (plan: DailyAdventurePlan) => boolean;
  recordWrongWord: (wordId: string) => void;
  defeatMonster: (wordId: string) => boolean;
  completeSpeakScenario: (scenarioId: string, xp: number) => boolean;
  recordSpeakAttempt: () => void;
  syncDecorationUnlocks: () => void;
  recordDailyAnswer: (correct: boolean) => void;
  recordCorrectAnswer: () => void;
  resetProgress: () => void;
};

function applyRewardList(state: GameState, rewards: Reward[]): Partial<GameState> {
  const nextResources = { ...state.resources };
  let xp = state.xp;

  for (const reward of rewards) {
    if (reward.type === "resource" && reward.resource && reward.amount) {
      nextResources[reward.resource] += reward.amount;
    }
    if (reward.type === "xp" && reward.xp) {
      xp += reward.xp;
    }
  }

  return { xp, resources: nextResources };
}

function applyRewards(
  state: GameState,
  rewards: RewardResult,
): Partial<GameState> {
  const nextResources = { ...state.resources };
  const nextUnlockedIds = [...state.unlockedIds];
  let xp = state.xp;

  for (const reward of rewards.rewards) {
    if (reward.type === "resource" && reward.resource && reward.amount) {
      nextResources[reward.resource] += reward.amount;
    }
    if (reward.type === "xp" && reward.xp) {
      xp += reward.xp;
    }
    if (reward.type === "unlock" && reward.unlockId) {
      if (!nextUnlockedIds.includes(reward.unlockId)) {
        nextUnlockedIds.push(reward.unlockId);
      }
    }
  }

  for (const unlockId of rewards.unlocks) {
    if (!nextUnlockedIds.includes(unlockId)) {
      nextUnlockedIds.push(unlockId);
    }
  }

  return {
    xp,
    resources: nextResources,
    unlockedIds: nextUnlockedIds,
  };
}

function mergeWordIds(existing: string[], incoming: string[]): string[] {
  const set = new Set(existing);
  for (const id of incoming) {
    set.add(id);
  }
  return [...set];
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addXp: (amount) =>
        set((state) => ({
          xp: state.xp + amount,
        })),

      addResource: (resource, amount) =>
        set((state) => ({
          resources: {
            ...state.resources,
            [resource]: state.resources[resource] + amount,
          },
        })),

      unlockItem: (unlockId) =>
        set((state) => ({
          unlockedIds: state.unlockedIds.includes(unlockId)
            ? state.unlockedIds
            : [...state.unlockedIds, unlockId],
        })),

      discoverWord: (wordId) =>
        set((state) => ({
          discoveredWordIds: state.discoveredWordIds.includes(wordId)
            ? state.discoveredWordIds
            : [...state.discoveredWordIds, wordId],
        })),

      markWordLearned: (wordId) =>
        set((state) => {
          const next = {
            ...state,
            discoveredWordIds: mergeWordIds(state.discoveredWordIds, [wordId]),
            learnedWordIds: state.learnedWordIds.includes(wordId)
              ? state.learnedWordIds
              : [...state.learnedWordIds, wordId],
            ...touchLearningDay(state),
          };
          return {
            ...next,
            ...withDecorationSync(next),
          };
        }),

      markWordMastered: (wordId) =>
        set((state) => {
          const dailyStats = normalizeDailyStats(state.dailyStats);
          const next = {
            ...state,
            discoveredWordIds: mergeWordIds(state.discoveredWordIds, [wordId]),
            learnedWordIds: mergeWordIds(state.learnedWordIds, [wordId]),
            masteredWordIds: state.masteredWordIds.includes(wordId)
              ? state.masteredWordIds
              : [...state.masteredWordIds, wordId],
            dailyStats: {
              ...dailyStats,
              learnedWords: dailyStats.learnedWords + 1,
            },
            ...touchLearningDay(state),
          };
          return {
            ...next,
            ...withDecorationSync(next),
          };
        }),

      recordDailyAnswer: (correct) =>
        set((state) => {
          const dailyStats = normalizeDailyStats(state.dailyStats);
          return {
            dailyStats: {
              ...dailyStats,
              correctAnswers: correct
                ? dailyStats.correctAnswers + 1
                : dailyStats.correctAnswers,
            },
          };
        }),

      recordCorrectAnswer: () => {
        get().addXp(XP_PER_CORRECT_ANSWER);
        get().recordDailyAnswer(true);
        set((state) => touchLearningDay(state));
      },

      completeQuest: (questId) => {
        const quest = getQuestById(questId);
        if (!quest) return null;

        const alreadyCompleted = get().completedQuestIds.includes(questId);
        if (alreadyCompleted) {
          return {
            rewards: [],
            unlocks: [],
            isFirstCompletion: false,
          };
        }

        const rewardResult = buildRewardResult(quest);

        set((state) => {
          const dailyStats = normalizeDailyStats(state.dailyStats);
          const applied = applyRewards(state, rewardResult);
          const next = {
            ...state,
            ...applied,
            completedQuestIds: [...state.completedQuestIds, questId],
            dailyStats: {
              ...dailyStats,
              completedQuests: dailyStats.completedQuests + 1,
            },
            ...touchLearningDay(state),
          };
          return {
            ...next,
            ...withDecorationSync(next),
          };
        });

        return rewardResult;
      },

      completeGuide: (guideId, keywordIds = []) => {
        if (get().completedGuideIds.includes(guideId)) {
          return false;
        }

        set((state) => {
          const dailyStats = normalizeDailyStats(state.dailyStats);
          const next = {
            ...state,
            completedGuideIds: [...state.completedGuideIds, guideId],
            discoveredWordIds: mergeWordIds(state.discoveredWordIds, keywordIds),
            learnedWordIds: mergeWordIds(state.learnedWordIds, keywordIds),
            xp: state.xp + 5,
            dailyStats: {
              ...dailyStats,
              correctAnswers: dailyStats.correctAnswers + 1,
            },
            ...touchLearningDay(state),
          };
          return {
            ...next,
            ...withDecorationSync(next),
          };
        });

        return true;
      },

      claimBuildIdea: (ideaId) => {
        if (get().completedBuildIdeaIds.includes(ideaId)) {
          return false;
        }

        const idea = getBuildIdeaById(ideaId);
        if (!idea) return false;

        set((state) => {
          const dailyStats = normalizeDailyStats(state.dailyStats);
          const applied = applyRewardList(state, idea.rewards);
          const keywordIds = idea.keywords.map((k) => k.wordId);

          return {
            ...applied,
            completedBuildIdeaIds: [...state.completedBuildIdeaIds, ideaId],
            discoveredWordIds: mergeWordIds(state.discoveredWordIds, keywordIds),
            learnedWordIds: mergeWordIds(state.learnedWordIds, keywordIds),
            dailyStats: {
              ...dailyStats,
              completedQuests: dailyStats.completedQuests + 1,
            },
          };
        });

        return true;
      },

      completeDailyAdventure: (plan) => {
        const dailyStats = normalizeDailyStats(get().dailyStats);
        if (
          dailyStats.dailyAdventureCompleted &&
          dailyStats.dailyAdventureId === plan.id
        ) {
          return false;
        }

        set((state) => {
          const stats = normalizeDailyStats(state.dailyStats);
          const applied = applyRewardList(state, plan.rewards);

          return {
            ...applied,
            discoveredWordIds: mergeWordIds(state.discoveredWordIds, plan.wordIds),
            learnedWordIds: mergeWordIds(state.learnedWordIds, plan.wordIds),
            dailyStats: {
              ...stats,
              dailyAdventureCompleted: true,
              dailyAdventureId: plan.id,
              completedQuests: stats.completedQuests + 1,
            },
          };
        });

        return true;
      },

      recordWrongWord: (wordId) =>
        set((state) => ({
          wrongWordCounts: {
            ...state.wrongWordCounts,
            [wordId]: (state.wrongWordCounts[wordId] ?? 0) + 1,
          },
        })),

      defeatMonster: (wordId) => {
        if (get().defeatedMonsterIds.includes(wordId)) {
          return false;
        }
        set((state) => {
          const next = {
            ...state,
            defeatedMonsterIds: [...state.defeatedMonsterIds, wordId],
            wrongWordCounts: {
              ...state.wrongWordCounts,
              [wordId]: 0,
            },
            masteredWordIds: state.masteredWordIds.includes(wordId)
              ? state.masteredWordIds
              : [...state.masteredWordIds, wordId],
            xp: state.xp + 10,
            ...touchLearningDay(state),
          };
          return {
            ...next,
            ...withDecorationSync(next),
          };
        });
        return true;
      },

      recordSpeakAttempt: () =>
        set((state) => {
          const dailyStats = normalizeDailyStats(state.dailyStats);
          return {
            dailyStats: {
              ...dailyStats,
              speakAttempts: dailyStats.speakAttempts + 1,
            },
            ...touchLearningDay(state),
          };
        }),

      completeSpeakScenario: (scenarioId, xp) => {
        if (get().completedSpeakIds.includes(scenarioId)) {
          return false;
        }
        set((state) => {
          const dailyStats = normalizeDailyStats(state.dailyStats);
          return {
            completedSpeakIds: [...state.completedSpeakIds, scenarioId],
            xp: state.xp + xp,
            dailyStats: {
              ...dailyStats,
              correctAnswers: dailyStats.correctAnswers + 1,
            },
            ...touchLearningDay(state),
          };
        });
        return true;
      },

      syncDecorationUnlocks: () =>
        set((state) => withDecorationSync(state)),

      resetProgress: () =>
        set({
          ...initialState,
          dailyStats: createDailyStats(),
        }),
    }),
    {
      name: "minewords-game-state",
      merge: (persisted, current) => {
        const saved = persisted as Partial<GameState>;
        const speakMigration = migrateSpeakIds(saved);
        const mergedState: GameState = {
          ...current,
          ...saved,
          resources: { ...defaultResources, ...saved.resources },
          discoveredWordIds: saved.discoveredWordIds ?? [],
          learnedWordIds: saved.learnedWordIds ?? [],
          completedGuideIds: saved.completedGuideIds ?? [],
          completedBuildIdeaIds: speakMigration.completedBuildIdeaIds,
          completedSpeakIds: speakMigration.completedSpeakIds,
          wrongWordCounts: saved.wrongWordCounts ?? {},
          defeatedMonsterIds: saved.defeatedMonsterIds ?? [],
          learningStreak: saved.learningStreak ?? 0,
          lastActiveDate: saved.lastActiveDate ?? "",
          dailyStats: normalizeDailyStats(saved.dailyStats),
        };

        return {
          ...current,
          ...mergedState,
          ...withDecorationSync(mergedState),
        };
      },
      partialize: (state) => ({
        playerName: state.playerName,
        xp: state.xp,
        resources: state.resources,
        completedQuestIds: state.completedQuestIds,
        unlockedIds: state.unlockedIds,
        masteredWordIds: state.masteredWordIds,
        discoveredWordIds: state.discoveredWordIds,
        learnedWordIds: state.learnedWordIds,
        completedGuideIds: state.completedGuideIds,
        completedBuildIdeaIds: state.completedBuildIdeaIds,
        completedSpeakIds: state.completedSpeakIds,
        wrongWordCounts: state.wrongWordCounts,
        defeatedMonsterIds: state.defeatedMonsterIds,
        learningStreak: state.learningStreak,
        lastActiveDate: state.lastActiveDate,
        dailyStats: state.dailyStats,
      }),
    },
  ),
);

export function usePlayerLevel(): number {
  return useGameStore((state) => Math.floor(state.xp / 100) + 1);
}
