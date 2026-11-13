import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getBuildIdeaById } from "@/data/buildIdeas";
import {
  DEFAULT_EXPLORE_ZONE_ID,
  ExploreZoneId,
  getExploreZoneById,
  isExploreZoneId,
} from "@/data/exploreZones";
import {
  getMonsterDropRewards,
  MONSTER_BONUS_LEARN_WORD_IDS,
} from "@/data/monsterDrops";
import { getQuestById, quests } from "@/data/quests";
import { getSpeakScenarioById } from "@/data/speakScenarios";
import { getTradeOfferById } from "@/data/trades";
import {
  getWeaponTierById,
  getWeaponTierIndex,
  weaponTiers,
  WeaponTierId,
} from "@/data/weapons";
import { XP_PER_CORRECT_ANSWER } from "@/data/rewards";
import {
  getTodayDateString,
  getWeekStartDateString,
  getYesterdayDateString,
} from "@/lib/date";
import { getDecorationUnlockIds } from "@/lib/decorationUnlocks";
import {
  getMonsterDropRewardsForZone,
  isExploreZoneUnlocked,
  resolveSelectedExploreZoneId,
} from "@/lib/exploreZones";
import {
  GAME_STATE_STORAGE_KEY,
  partializeGameState,
} from "@/lib/progressBackup";
import {
  buildRewardResult,
  getErrandProgress,
  getFightErrandIdsForResource,
} from "@/lib/questEngine";
import {
  DailyStats,
  GameState,
  ResourceType,
  Reward,
  RewardResult,
  DailyAdventurePlan,
  RoomBlockType,
  RoomBlocks,
  RoomSlotId,
  WeekSpeakStats,
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

/** Cost to place each block type into the home room. */
export const ROOM_BLOCK_COST: Record<
  RoomBlockType,
  { resource: ResourceType; amount: number }
> = {
  plank: { resource: "wood", amount: 1 },
  cobble: { resource: "stone", amount: 1 },
  // MW-52: encyclopedia block words become placeables (same wood/stone sinks).
  glass: { resource: "wood", amount: 1 },
  wool: { resource: "wood", amount: 1 },
};

/** Placing these block types marks the matching dictionary word learned. */
export const ROOM_BLOCK_LEARN_WORD_ID: Partial<Record<RoomBlockType, string>> = {
  glass: "glass",
  wool: "wool",
  plank: "plank",
};

export const ROOM_FLOOR_SLOTS: RoomSlotId[] = [
  "floor-0",
  "floor-1",
  "floor-2",
  "floor-3",
  "floor-4",
  "floor-5",
];

export const ROOM_WALL_SLOTS: RoomSlotId[] = [
  "wall-0",
  "wall-1",
  "wall-2",
  "wall-3",
];

function createDailyStats(): DailyStats {
  return {
    date: getTodayDateString(),
    completedQuests: 0,
    buildIdeasClaimed: 0,
    adventuresCompleted: 0,
    correctAnswers: 0,
    learnedWords: 0,
    masteredTodayIds: [],
    dailyAdventureCompleted: false,
    dailyAdventureId: "",
    speakAttempts: 0,
    speakCompletions: 0,
    confirmCompletions: 0,
  };
}

function createWeekSpeakStats(
  seed?: Pick<DailyStats, "speakCompletions" | "confirmCompletions">,
): WeekSpeakStats {
  return {
    weekStart: getWeekStartDateString(),
    speakCompletions: seed?.speakCompletions ?? 0,
    confirmCompletions: seed?.confirmCompletions ?? 0,
  };
}

function normalizeDailyStats(stats: Partial<DailyStats> | undefined): DailyStats {
  const base = createDailyStats();
  if (stats?.date === getTodayDateString()) {
    return {
      ...base,
      ...stats,
      buildIdeasClaimed: stats.buildIdeasClaimed ?? 0,
      adventuresCompleted: stats.adventuresCompleted ?? 0,
      speakAttempts: stats.speakAttempts ?? 0,
      speakCompletions: stats.speakCompletions ?? 0,
      confirmCompletions: stats.confirmCompletions ?? 0,
      masteredTodayIds: stats.masteredTodayIds ?? [],
    };
  }
  return base;
}

/** Keep Ship B counters for the local Monday–Sunday week; seed from today on first week. */
export function normalizeWeekSpeakStats(
  stats: Partial<WeekSpeakStats> | undefined,
  daily?: DailyStats,
): WeekSpeakStats {
  const weekStart = getWeekStartDateString();
  if (stats?.weekStart === weekStart) {
    return {
      weekStart,
      speakCompletions: stats.speakCompletions ?? 0,
      confirmCompletions: stats.confirmCompletions ?? 0,
    };
  }
  const today = getTodayDateString();
  const seed =
    daily?.date === today
      ? {
          speakCompletions: daily.speakCompletions,
          confirmCompletions: daily.confirmCompletions,
        }
      : undefined;
  return createWeekSpeakStats(seed);
}

function touchLearningDay(state: GameState): Pick<GameState, "learningStreak" | "lastActiveDate"> {
  const today = getTodayDateString();
  if (state.lastActiveDate === today) {
    return {
      learningStreak: state.learningStreak,
      lastActiveDate: state.lastActiveDate,
    };
  }

  const continued = state.lastActiveDate === getYesterdayDateString();

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

/** Shared by zustand persist `merge` and parent-page import (MW-46). */
export function mergePersistedGameState<T extends GameState>(
  persisted: unknown,
  current: T,
): T {
  if (persisted == null || typeof persisted !== "object") {
    return current;
  }
  const saved = persisted as Partial<GameState>;
  const speakMigration = migrateSpeakIds(saved);
  const unlockedIds = saved.unlockedIds ?? current.unlockedIds;
  const dailyStats = normalizeDailyStats(saved.dailyStats);
  const mergedState: GameState = {
    ...current,
    ...saved,
    resources: { ...defaultResources, ...saved.resources },
    roomBlocks: saved.roomBlocks ?? {},
    selectedExploreZoneId: resolveSelectedExploreZoneId(
      saved.selectedExploreZoneId ?? current.selectedExploreZoneId,
      unlockedIds,
    ),
    errandProgress: saved.errandProgress ?? {},
    discoveredWordIds: saved.discoveredWordIds ?? [],
    learnedWordIds: saved.learnedWordIds ?? [],
    completedGuideIds: saved.completedGuideIds ?? [],
    completedBuildIdeaIds: speakMigration.completedBuildIdeaIds,
    completedSpeakIds: speakMigration.completedSpeakIds,
    wrongWordCounts: saved.wrongWordCounts ?? {},
    defeatedMonsterIds: saved.defeatedMonsterIds ?? [],
    learningStreak: saved.learningStreak ?? 0,
    lastActiveDate: saved.lastActiveDate ?? "",
    dailyStats,
    weekSpeakStats: normalizeWeekSpeakStats(saved.weekSpeakStats, dailyStats),
    // Missing key = never coached (show once). Only markOnboardingSeen flips this.
    hasSeenOnboarding: saved.hasSeenOnboarding ?? false,
  };

  return {
    ...current,
    ...mergedState,
    ...withDecorationSync(mergedState),
  };
}

/** Discover + learn without mastering (placeables / related drop words). */
function applyWordLearnedState(state: GameState, wordId: string): GameState {
  const dailyStats = normalizeDailyStats(state.dailyStats);
  const newlyLearned = !state.learnedWordIds.includes(wordId);
  if (!newlyLearned && state.discoveredWordIds.includes(wordId)) {
    return state;
  }
  return {
    ...state,
    discoveredWordIds: mergeWordIds(state.discoveredWordIds, [wordId]),
    learnedWordIds: mergeWordIds(state.learnedWordIds, [wordId]),
    dailyStats: {
      ...dailyStats,
      learnedWords: dailyStats.learnedWords + (newlyLearned ? 1 : 0),
    },
  };
}

function applyWordMasteredState(state: GameState, wordId: string): GameState {
  const dailyStats = normalizeDailyStats(state.dailyStats);
  const newlyMastered = !state.masteredWordIds.includes(wordId);
  const newlyLearned = !state.learnedWordIds.includes(wordId);

  return {
    ...state,
    discoveredWordIds: mergeWordIds(state.discoveredWordIds, [wordId]),
    learnedWordIds: mergeWordIds(state.learnedWordIds, [wordId]),
    masteredWordIds: newlyMastered
      ? [...state.masteredWordIds, wordId]
      : state.masteredWordIds,
    dailyStats: {
      ...dailyStats,
      learnedWords: dailyStats.learnedWords + (newlyLearned ? 1 : 0),
      masteredTodayIds:
        newlyMastered && !dailyStats.masteredTodayIds.includes(wordId)
          ? [...dailyStats.masteredTodayIds, wordId]
          : dailyStats.masteredTodayIds,
    },
  };
}

const initialState: GameState = {
  playerName: "Alex",
  xp: 0,
  resources: { ...defaultResources },
  roomBlocks: {},
  selectedExploreZoneId: DEFAULT_EXPLORE_ZONE_ID,
  completedQuestIds: [],
  errandProgress: {},
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
  weekSpeakStats: createWeekSpeakStats(),
  hasSeenOnboarding: false,
};

export type DefeatMonsterOptions = {
  /** Bias drops toward the explore zone's craft material. */
  zoneId?: ExploreZoneId;
  /** Wild zone fights can be re-farmed so craft goals stay feedable. */
  farmable?: boolean;
};

type GameStore = GameState & {
  addXp: (amount: number) => void;
  addResource: (resource: ResourceType, amount: number) => void;
  spendResource: (resource: ResourceType, amount: number) => boolean;
  placeRoomBlock: (slotId: RoomSlotId, blockType: RoomBlockType) => boolean;
  unlockItem: (unlockId: string) => void;
  discoverWord: (wordId: string) => void;
  markWordLearned: (wordId: string) => void;
  markWordsLearned: (wordIds: string[]) => void;
  markWordMastered: (wordId: string) => void;
  completeQuest: (questId: string) => RewardResult | null;
  completeGuide: (guideId: string, keywordIds?: string[]) => boolean;
  claimBuildIdea: (ideaId: string) => boolean;
  completeDailyAdventure: (plan: DailyAdventurePlan) => boolean;
  recordWrongWord: (wordId: string) => void;
  defeatMonster: (
    wordId: string,
    options?: DefeatMonsterOptions,
  ) => RewardResult | null;
  setSelectedExploreZone: (zoneId: ExploreZoneId) => boolean;
  /** Spend recipe mats + unlock weapon after a successful speak-craft. */
  craftWeapon: (weaponId: WeaponTierId) => RewardResult | null;
  /** Spend cost mats + gain rare mats after a successful speak-trade (MW-20). */
  executeTrade: (tradeId: string) => RewardResult | null;
  completeSpeakScenario: (scenarioId: string, xp: number) => boolean;
  recordSpeakAttempt: () => void;
  /** Mic speak cleared a gate (attack / craft / trade / phonics / scenario). */
  recordSpeakCompletion: () => void;
  /** Manual confirm (or follow-then-confirm) cleared a gate. */
  recordConfirmCompletion: () => void;
  syncDecorationUnlocks: () => void;
  recordDailyAnswer: (correct: boolean) => void;
  recordCorrectAnswer: (options?: { practiceMode?: boolean }) => void;
  markOnboardingSeen: () => void;
  resetProgress: () => void;
  /** Replace local progress from a parsed backup (MW-46). */
  importProgress: (saved: Partial<GameState>) => void;
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

      spendResource: (resource, amount) => {
        const state = get();
        if (amount <= 0 || state.resources[resource] < amount) {
          return false;
        }
        set({
          resources: {
            ...state.resources,
            [resource]: state.resources[resource] - amount,
          },
        });
        return true;
      },

      placeRoomBlock: (slotId, blockType) => {
        const state = get();
        if (state.roomBlocks[slotId]) {
          return false;
        }
        const cost = ROOM_BLOCK_COST[blockType];
        if (state.resources[cost.resource] < cost.amount) {
          return false;
        }
        const nextBlocks: RoomBlocks = {
          ...state.roomBlocks,
          [slotId]: blockType,
        };
        const learnWordId = ROOM_BLOCK_LEARN_WORD_ID[blockType];
        set((current) => {
          const spent: GameState = {
            ...current,
            resources: {
              ...current.resources,
              [cost.resource]: current.resources[cost.resource] - cost.amount,
            },
            roomBlocks: nextBlocks,
          };
          const learned = learnWordId
            ? applyWordLearnedState(spent, learnWordId)
            : spent;
          return { ...learned, ...withDecorationSync(learned) };
        });
        return true;
      },

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
          const dailyStats = normalizeDailyStats(state.dailyStats);
          const isNew = !state.learnedWordIds.includes(wordId);
          const next = {
            ...state,
            discoveredWordIds: mergeWordIds(state.discoveredWordIds, [wordId]),
            learnedWordIds: isNew
              ? [...state.learnedWordIds, wordId]
              : state.learnedWordIds,
            dailyStats: isNew
              ? { ...dailyStats, learnedWords: dailyStats.learnedWords + 1 }
              : dailyStats,
            ...touchLearningDay(state),
          };
          return { ...next, ...withDecorationSync(next) };
        }),

      markWordsLearned: (wordIds) =>
        set((state) => {
          const dailyStats = normalizeDailyStats(state.dailyStats);
          const newIds = wordIds.filter((id) => !state.learnedWordIds.includes(id));
          const next = {
            ...state,
            discoveredWordIds: mergeWordIds(state.discoveredWordIds, wordIds),
            learnedWordIds: mergeWordIds(state.learnedWordIds, wordIds),
            dailyStats:
              newIds.length > 0
                ? {
                    ...dailyStats,
                    learnedWords: dailyStats.learnedWords + newIds.length,
                  }
                : dailyStats,
            ...touchLearningDay(state),
          };
          return { ...next, ...withDecorationSync(next) };
        }),

      markWordMastered: (wordId) =>
        set((state) => {
          const next = {
            ...applyWordMasteredState(state, wordId),
            ...touchLearningDay(state),
          };
          return { ...next, ...withDecorationSync(next) };
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

      recordCorrectAnswer: (options) => {
        if (options?.practiceMode) return;
        set((state) => {
          const dailyStats = normalizeDailyStats(state.dailyStats);
          return {
            xp: state.xp + XP_PER_CORRECT_ANSWER,
            dailyStats: {
              ...dailyStats,
              correctAnswers: dailyStats.correctAnswers + 1,
            },
            ...touchLearningDay(state),
          };
        });
      },

      completeQuest: (questId) => {
        const quest = getQuestById(questId);
        if (!quest) return null;

        const state = get();
        const alreadyCompleted = state.completedQuestIds.includes(questId);
        if (alreadyCompleted) {
          return {
            rewards: [],
            unlocks: [],
            isFirstCompletion: false,
          };
        }

        if (quest.errand) {
          const progress = getErrandProgress(quest, {
            errandProgress: state.errandProgress,
            resources: state.resources,
            unlockedIds: state.unlockedIds,
            completedQuestIds: state.completedQuestIds,
          });
          if (!progress?.readyToClaim) {
            return null;
          }
        }

        const rewardResult = buildRewardResult(quest);

        set((current) => {
          const dailyStats = normalizeDailyStats(current.dailyStats);
          const applied = applyRewards(current, rewardResult);
          const next = {
            ...current,
            ...applied,
            completedQuestIds: [...current.completedQuestIds, questId],
            dailyStats: {
              ...dailyStats,
              completedQuests: dailyStats.completedQuests + 1,
            },
            ...touchLearningDay(current),
          };
          return { ...next, ...withDecorationSync(next) };
        });

        return rewardResult;
      },

      completeGuide: (guideId, keywordIds = []) => {
        if (get().completedGuideIds.includes(guideId)) {
          return false;
        }

        set((state) => {
          const dailyStats = normalizeDailyStats(state.dailyStats);
          const newLearned = keywordIds.filter((id) => !state.learnedWordIds.includes(id));
          const next = {
            ...state,
            completedGuideIds: [...state.completedGuideIds, guideId],
            discoveredWordIds: mergeWordIds(state.discoveredWordIds, keywordIds),
            learnedWordIds: mergeWordIds(state.learnedWordIds, keywordIds),
            xp: state.xp + 5,
            dailyStats: {
              ...dailyStats,
              correctAnswers: dailyStats.correctAnswers + 1,
              learnedWords: dailyStats.learnedWords + newLearned.length,
            },
            ...touchLearningDay(state),
          };
          return { ...next, ...withDecorationSync(next) };
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
          const newLearned = keywordIds.filter((id) => !state.learnedWordIds.includes(id));
          const next = {
            ...state,
            ...applied,
            completedBuildIdeaIds: [...state.completedBuildIdeaIds, ideaId],
            discoveredWordIds: mergeWordIds(state.discoveredWordIds, keywordIds),
            learnedWordIds: mergeWordIds(state.learnedWordIds, keywordIds),
            dailyStats: {
              ...dailyStats,
              buildIdeasClaimed: dailyStats.buildIdeasClaimed + 1,
              learnedWords: dailyStats.learnedWords + newLearned.length,
            },
            ...touchLearningDay(state),
          };
          return { ...next, ...withDecorationSync(next) };
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
          const newLearned = plan.wordIds.filter((id) => !state.learnedWordIds.includes(id));
          const next = {
            ...state,
            ...applied,
            discoveredWordIds: mergeWordIds(state.discoveredWordIds, plan.wordIds),
            learnedWordIds: mergeWordIds(state.learnedWordIds, plan.wordIds),
            dailyStats: {
              ...stats,
              dailyAdventureCompleted: true,
              dailyAdventureId: plan.id,
              adventuresCompleted: stats.adventuresCompleted + 1,
              learnedWords: stats.learnedWords + newLearned.length,
            },
            ...touchLearningDay(state),
          };
          return { ...next, ...withDecorationSync(next) };
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

      defeatMonster: (wordId, options) => {
        const alreadyDefeated = get().defeatedMonsterIds.includes(wordId);
        const farmable = options?.farmable === true;
        if (alreadyDefeated && !farmable) {
          return null;
        }

        const zoneId = options?.zoneId;
        const zone = zoneId ? getExploreZoneById(zoneId) : undefined;
        const dropRewards = zoneId
          ? getMonsterDropRewardsForZone(wordId, zoneId)
          : getMonsterDropRewards(wordId);
        const rewardResult: RewardResult = {
          rewards: dropRewards,
          unlocks: [],
          isFirstCompletion: !alreadyDefeated,
        };

        set((state) => {
          let base = alreadyDefeated
            ? state
            : applyWordMasteredState(state, wordId);
          if (!alreadyDefeated) {
            for (const bonusId of MONSTER_BONUS_LEARN_WORD_IDS[wordId] ?? []) {
              base = applyWordLearnedState(base, bonusId);
            }
          }
          const applied = applyRewardList(base, dropRewards);
          const fightErrandIds = getFightErrandIdsForResource(
            zone?.focusResource,
            base.unlockedIds,
            base.completedQuestIds,
          );
          const nextErrandProgress = { ...base.errandProgress };
          for (const errandId of fightErrandIds) {
            nextErrandProgress[errandId] = (nextErrandProgress[errandId] ?? 0) + 1;
          }
          const next = {
            ...base,
            ...applied,
            errandProgress: nextErrandProgress,
            defeatedMonsterIds: alreadyDefeated
              ? base.defeatedMonsterIds
              : [...base.defeatedMonsterIds, wordId],
            wrongWordCounts: {
              ...base.wrongWordCounts,
              [wordId]: 0,
            },
            ...touchLearningDay(state),
          };
          return { ...next, ...withDecorationSync(next) };
        });

        return rewardResult;
      },

      setSelectedExploreZone: (zoneId) => {
        if (!isExploreZoneId(zoneId)) return false;
        const zone = getExploreZoneById(zoneId);
        if (!zone) return false;
        const state = get();
        if (!isExploreZoneUnlocked(zone, state.unlockedIds)) {
          return false;
        }
        set({ selectedExploreZoneId: zoneId });
        return true;
      },

      craftWeapon: (weaponId) => {
        const tier = getWeaponTierById(weaponId);
        if (!tier) return null;

        const state = get();
        if (state.unlockedIds.includes(weaponId)) {
          return {
            rewards: [],
            unlocks: [],
            isFirstCompletion: false,
          };
        }

        const tierIndex = getWeaponTierIndex(weaponId);
        if (tierIndex > 0) {
          const previous = weaponTiers[tierIndex - 1];
          if (previous && !state.unlockedIds.includes(previous.id)) {
            return null;
          }
        }

        for (const cost of tier.costs) {
          if (state.resources[cost.resource] < cost.amount) {
            return null;
          }
        }

        const bonusUnlocks =
          weaponId === "diamond-sword" ? (["diamond-speaker"] as string[]) : [];
        const craftUnlocks = [weaponId, ...bonusUnlocks];
        const craftRewards: Reward[] = [
          { type: "xp", xp: tier.craftXp },
          { type: "unlock", unlockId: weaponId },
          ...bonusUnlocks.map((unlockId) => ({
            type: "unlock" as const,
            unlockId,
          })),
        ];
        const rewardResult: RewardResult = {
          rewards: craftRewards,
          unlocks: craftUnlocks,
          isFirstCompletion: true,
        };

        set((current) => {
          const nextResources = { ...current.resources };
          for (const cost of tier.costs) {
            nextResources[cost.resource] -= cost.amount;
          }
          let nextUnlocked = current.unlockedIds.includes(weaponId)
            ? current.unlockedIds
            : [...current.unlockedIds, weaponId];
          for (const unlockId of bonusUnlocks) {
            if (!nextUnlocked.includes(unlockId)) {
              nextUnlocked = [...nextUnlocked, unlockId];
            }
          }

          // Auto-claim matching craft-weapon errands so kids don't bounce to a quiz menu.
          const craftErrandIds = quests
            .filter(
              (q) =>
                q.errand?.goal.type === "craft-weapon" &&
                q.errand.goal.weaponId === weaponId &&
                !current.completedQuestIds.includes(q.id),
            )
            .map((q) => q.id);
          const bonusXp = craftErrandIds.reduce((sum, id) => {
            const q = getQuestById(id);
            const xpReward = q?.rewards.find((r) => r.type === "xp")?.xp ?? 0;
            return sum + xpReward;
          }, 0);

          const next: GameState = {
            ...current,
            resources: nextResources,
            unlockedIds: nextUnlocked,
            completedQuestIds: [...current.completedQuestIds, ...craftErrandIds],
            xp: current.xp + tier.craftXp + bonusXp,
            ...touchLearningDay(current),
          };
          return { ...next, ...withDecorationSync(next) };
        });

        return rewardResult;
      },

      executeTrade: (tradeId) => {
        const offer = getTradeOfferById(tradeId);
        if (!offer) return null;

        const state = get();
        for (const cost of offer.costs) {
          if (state.resources[cost.resource] < cost.amount) {
            return null;
          }
        }

        const firstTrade = !state.unlockedIds.includes("village-trader");
        const tradeUnlockIds = firstTrade
          ? (["village-trader", "village-map"] as string[])
          : [];
        const tradeRewards: Reward[] = [
          { type: "xp", xp: offer.craftXp },
          ...offer.gains.map((gain) => ({
            type: "resource" as const,
            resource: gain.resource,
            amount: gain.amount,
          })),
          ...tradeUnlockIds.map((unlockId) => ({
            type: "unlock" as const,
            unlockId,
          })),
        ];

        const rewardResult: RewardResult = {
          rewards: tradeRewards,
          unlocks: tradeUnlockIds,
          isFirstCompletion: firstTrade,
        };

        set((current) => {
          const nextResources = { ...current.resources };
          for (const cost of offer.costs) {
            nextResources[cost.resource] -= cost.amount;
          }
          for (const gain of offer.gains) {
            nextResources[gain.resource] =
              (nextResources[gain.resource] ?? 0) + gain.amount;
          }

          let nextUnlocked = current.unlockedIds;
          for (const unlockId of tradeUnlockIds) {
            if (!nextUnlocked.includes(unlockId)) {
              nextUnlocked = [...nextUnlocked, unlockId];
            }
          }

          const dailyStats = normalizeDailyStats(current.dailyStats);
          const newLearned = offer.wordIds.filter(
            (id) => !current.learnedWordIds.includes(id),
          );

          const next: GameState = {
            ...current,
            resources: nextResources,
            unlockedIds: nextUnlocked,
            xp: current.xp + offer.craftXp,
            discoveredWordIds: mergeWordIds(
              current.discoveredWordIds,
              offer.wordIds,
            ),
            learnedWordIds: mergeWordIds(
              current.learnedWordIds,
              offer.wordIds,
            ),
            dailyStats: {
              ...dailyStats,
              learnedWords: dailyStats.learnedWords + newLearned.length,
            },
            ...touchLearningDay(current),
          };
          return { ...next, ...withDecorationSync(next) };
        });

        return rewardResult;
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

      recordSpeakCompletion: () =>
        set((state) => {
          const dailyStats = normalizeDailyStats(state.dailyStats);
          const weekSpeakStats = normalizeWeekSpeakStats(
            state.weekSpeakStats,
            dailyStats,
          );
          return {
            dailyStats: {
              ...dailyStats,
              speakCompletions: dailyStats.speakCompletions + 1,
            },
            weekSpeakStats: {
              ...weekSpeakStats,
              speakCompletions: weekSpeakStats.speakCompletions + 1,
            },
            ...touchLearningDay(state),
          };
        }),

      recordConfirmCompletion: () =>
        set((state) => {
          const dailyStats = normalizeDailyStats(state.dailyStats);
          const weekSpeakStats = normalizeWeekSpeakStats(
            state.weekSpeakStats,
            dailyStats,
          );
          return {
            dailyStats: {
              ...dailyStats,
              confirmCompletions: dailyStats.confirmCompletions + 1,
            },
            weekSpeakStats: {
              ...weekSpeakStats,
              confirmCompletions: weekSpeakStats.confirmCompletions + 1,
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
          const scenario = getSpeakScenarioById(scenarioId);
          const keywordIds = scenario?.keywords ?? [];
          const newLearned = keywordIds.filter((id) => !state.learnedWordIds.includes(id));
          return {
            completedSpeakIds: [...state.completedSpeakIds, scenarioId],
            discoveredWordIds: mergeWordIds(state.discoveredWordIds, keywordIds),
            learnedWordIds: mergeWordIds(state.learnedWordIds, keywordIds),
            xp: state.xp + xp,
            dailyStats: {
              ...dailyStats,
              correctAnswers: dailyStats.correctAnswers + 1,
              learnedWords: dailyStats.learnedWords + newLearned.length,
            },
            ...touchLearningDay(state),
          };
        });
        return true;
      },

      syncDecorationUnlocks: () => set((state) => withDecorationSync(state)),

      markOnboardingSeen: () =>
        set((state) =>
          state.hasSeenOnboarding ? state : { hasSeenOnboarding: true },
        ),

      resetProgress: () =>
        set({
          ...initialState,
          dailyStats: createDailyStats(),
          weekSpeakStats: createWeekSpeakStats(),
        }),

      importProgress: (saved) =>
        set((current) => mergePersistedGameState(saved, current)),
    }),
    {
      name: GAME_STATE_STORAGE_KEY,
      merge: (persisted, current) => {
        // Zustand calls merge(undefined, current) when storage is empty.
        // Must not throw — a throw aborts hydration and hasHydrated stays false.
        return mergePersistedGameState(persisted, current);
      },
      partialize: (state) => partializeGameState(state),
    },
  ),
);

export function usePlayerLevel(): number {
  return useGameStore((state) => Math.floor(state.xp / 100) + 1);
}
