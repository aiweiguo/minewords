import { getQuestById, quests } from "@/data/quests";
import { getCurrentWeaponGoal } from "@/lib/weaponGoal";
import { getLevelFromXp } from "@/lib/progress";
import {
  MaterialErrand,
  Quest,
  QuestStatus,
  QuestStep,
  ResourceType,
  RewardResult,
} from "@/types";

/** Legacy quiz validator — guides / listening still use QuestStep. */
export function validateStep(step: QuestStep, answer: string): boolean {
  return step.answer.trim().toLowerCase() === answer.trim().toLowerCase();
}

export type ErrandProgressView = {
  current: number;
  target: number;
  labelCn: string;
  labelEn: string;
  readyToClaim: boolean;
  /** Primary action while the errand is in progress. */
  actionHref: string;
  actionLabelCn: string;
  actionLabelEn: string;
};

function isMaterialErrand(quest: Quest): quest is Quest & { errand: MaterialErrand } {
  return Boolean(quest.errand);
}

export function getErrandProgress(
  quest: Quest,
  opts: {
    errandProgress: Record<string, number>;
    resources: Record<ResourceType, number>;
    unlockedIds: string[];
    completedQuestIds: string[];
  },
): ErrandProgressView | null {
  if (!isMaterialErrand(quest)) return null;

  const { errand } = quest;
  const completed = opts.completedQuestIds.includes(quest.id);
  const craftHref = `/crafting/${errand.weaponId}`;
  const exploreHref = errand.exploreZoneId
    ? `/explore`
    : "/explore";

  if (errand.goal.type === "defeat-monsters") {
    const current = Math.min(
      opts.errandProgress[quest.id] ?? 0,
      errand.goal.amount,
    );
    const ready = current >= errand.goal.amount;
    return {
      current,
      target: errand.goal.amount,
      labelCn: `已打怪 ${current}/${errand.goal.amount}`,
      labelEn: `Fights ${current}/${errand.goal.amount}`,
      readyToClaim: ready && !completed,
      actionHref: exploreHref,
      actionLabelCn: ready ? "领取材料" : "去打怪",
      actionLabelEn: ready ? "Claim" : "Explore",
    };
  }

  if (errand.goal.type === "gather-resource") {
    const have = opts.resources[errand.goal.resource] ?? 0;
    const current = Math.min(have, errand.goal.amount);
    const ready = have >= errand.goal.amount;
    return {
      current,
      target: errand.goal.amount,
      labelCn: `${errand.goal.resource} ${current}/${errand.goal.amount}`,
      labelEn: `${errand.goal.resource} ${current}/${errand.goal.amount}`,
      readyToClaim: ready && !completed,
      actionHref: ready ? craftHref : exploreHref,
      actionLabelCn: ready ? "领取并去合成" : "继续攒材料",
      actionLabelEn: ready ? "Claim · Craft" : "Keep gathering",
    };
  }

  // craft-weapon
  const owned = opts.unlockedIds.includes(errand.goal.weaponId);
  return {
    current: owned || completed ? 1 : 0,
    target: 1,
    labelCn: owned || completed ? "已合成" : "尚未合成",
    labelEn: owned || completed ? "Crafted" : "Not crafted",
    readyToClaim: owned && !completed,
    actionHref: craftHref,
    actionLabelCn: owned ? "领取奖励" : "去合成",
    actionLabelEn: owned ? "Claim" : "Craft",
  };
}

export function getQuestStatus(
  quest: Quest,
  xp: number,
  completedQuestIds: string[],
  unlockedIds: string[] = [],
): QuestStatus {
  if (completedQuestIds.includes(quest.id)) {
    return "completed";
  }

  if (quest.errand?.goal.type === "craft-weapon") {
    if (unlockedIds.includes(quest.errand.goal.weaponId)) {
      return "available";
    }
  }

  if (getLevelFromXp(xp) < quest.requiredLevel) {
    return "locked";
  }

  // Gate stone-tier errands until wooden sword is owned.
  if (quest.errand?.weaponId === "stone-sword") {
    if (!unlockedIds.includes("wooden-sword")) {
      return "locked";
    }
  }

  // Hide craft errand until that weapon is the current goal or already claimable.
  if (quest.errand?.goal.type === "craft-weapon") {
    const goal = getCurrentWeaponGoal(unlockedIds);
    if (goal && goal.id !== quest.errand.weaponId) {
      return "locked";
    }
  }

  return "available";
}

export function isQuestLocked(
  quest: Quest,
  xp: number,
  completedQuestIds: string[],
  unlockedIds: string[] = [],
): boolean {
  return getQuestStatus(quest, xp, completedQuestIds, unlockedIds) === "locked";
}

export function canClaimQuestRewards(
  questId: string,
  completedQuestIds: string[],
): boolean {
  return !completedQuestIds.includes(questId);
}

export function buildRewardResult(quest: Quest): RewardResult {
  return {
    rewards: quest.rewards,
    unlocks: quest.unlocks ?? [],
    isFirstCompletion: true,
  };
}

export function getQuestCompletionSummary(questId: string): RewardResult | null {
  const quest = getQuestById(questId);
  if (!quest) return null;
  return buildRewardResult(quest);
}

export function formatRewardPreview(quest: Quest): string {
  return quest.rewards
    .map((reward) => {
      if (reward.type === "resource" && reward.resource) {
        return `${capitalize(reward.resource)} x${reward.amount ?? 0}`;
      }
      if (reward.type === "xp") {
        return `XP +${reward.xp ?? 0}`;
      }
      return "Unlock";
    })
    .join(", ");
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getUnlockConditionText(questId?: string, questTitleCn?: string): string {
  if (!questId || !questTitleCn) {
    return "完成指定材料委托后解锁";
  }
  return `完成「${questTitleCn}」委托后解锁`;
}

/** Active errands for the player's current weapon goal (plus in-progress claims). */
export function listRelevantErrands(
  unlockedIds: string[],
  completedQuestIds: string[],
): Quest[] {
  const goal = getCurrentWeaponGoal(unlockedIds);
  const weaponId = goal?.id;

  return quests.filter((quest) => {
    if (!quest.errand) return false;
    if (completedQuestIds.includes(quest.id)) {
      return quest.errand.weaponId === weaponId || !weaponId;
    }
    if (weaponId) {
      return quest.errand.weaponId === weaponId;
    }
    // Line complete — show stone craft claim leftovers only if any.
    return (
      quest.errand.goal.type === "craft-weapon" &&
      unlockedIds.includes(quest.errand.goal.weaponId) &&
      !completedQuestIds.includes(quest.id)
    );
  });
}

/** Errand IDs that should tick on a successful speak-attack fight. */
export function getFightErrandIdsForResource(
  resource: ResourceType | undefined,
  unlockedIds: string[],
  completedQuestIds: string[],
): string[] {
  const goal = getCurrentWeaponGoal(unlockedIds);
  return quests
    .filter((quest) => {
      if (!quest.errand || completedQuestIds.includes(quest.id)) return false;
      if (quest.errand.goal.type !== "defeat-monsters") return false;
      if (goal && quest.errand.weaponId !== goal.id) return false;
      if (
        resource &&
        quest.errand.goal.resource &&
        quest.errand.goal.resource !== resource
      ) {
        return false;
      }
      return true;
    })
    .map((quest) => quest.id);
}
