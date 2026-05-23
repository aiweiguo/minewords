import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getQuestById } from "@/data/quests";
import { XP_PER_CORRECT_ANSWER } from "@/data/rewards";
import { buildRewardResult } from "@/lib/questEngine";
import {
  DailyStats,
  GameState,
  ResourceType,
  RewardResult,
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
  };
}

function normalizeDailyStats(stats: DailyStats): DailyStats {
  if (stats.date === getTodayDateString()) {
    return stats;
  }
  return createDailyStats();
}

const initialState: GameState = {
  playerName: "Alex",
  xp: 0,
  resources: { ...defaultResources },
  completedQuestIds: [],
  unlockedIds: [],
  masteredWordIds: [],
  dailyStats: createDailyStats(),
};

type GameStore = GameState & {
  addXp: (amount: number) => void;
  addResource: (resource: ResourceType, amount: number) => void;
  unlockItem: (unlockId: string) => void;
  markWordMastered: (wordId: string) => void;
  completeQuest: (questId: string) => RewardResult | null;
  recordDailyAnswer: (correct: boolean) => void;
  recordCorrectAnswer: () => void;
  resetProgress: () => void;
};

function applyRewards(
  state: GameState,
  rewards: RewardResult,
): Partial<GameState> {
  const nextResources = { ...state.resources };
  const nextUnlockedIds = [...state.unlockedIds];

  for (const reward of rewards.rewards) {
    if (reward.type === "resource" && reward.resource && reward.amount) {
      nextResources[reward.resource] += reward.amount;
    }
    if (reward.type === "xp" && reward.xp) {
      state = { ...state, xp: state.xp + reward.xp };
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
    xp: state.xp,
    resources: nextResources,
    unlockedIds: nextUnlockedIds,
  };
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

      markWordMastered: (wordId) =>
        set((state) => ({
          masteredWordIds: state.masteredWordIds.includes(wordId)
            ? state.masteredWordIds
            : [...state.masteredWordIds, wordId],
          dailyStats: {
            ...normalizeDailyStats(state.dailyStats),
            learnedWords: normalizeDailyStats(state.dailyStats).learnedWords + 1,
          },
        })),

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

          return {
            ...applied,
            completedQuestIds: [...state.completedQuestIds, questId],
            dailyStats: {
              ...dailyStats,
              completedQuests: dailyStats.completedQuests + 1,
            },
          };
        });

        return rewardResult;
      },

      resetProgress: () =>
        set({
          ...initialState,
          dailyStats: createDailyStats(),
        }),
    }),
    {
      name: "minewords-game-state",
      partialize: (state) => ({
        playerName: state.playerName,
        xp: state.xp,
        resources: state.resources,
        completedQuestIds: state.completedQuestIds,
        unlockedIds: state.unlockedIds,
        masteredWordIds: state.masteredWordIds,
        dailyStats: state.dailyStats,
      }),
    },
  ),
);

export function usePlayerLevel(): number {
  return useGameStore((state) => Math.floor(state.xp / 100) + 1);
}
