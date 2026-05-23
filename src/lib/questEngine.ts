import { getQuestById } from "@/data/quests";
import { getLevelFromXp } from "@/lib/progress";
import { Quest, QuestStep, QuestStatus, RewardResult } from "@/types";

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase();
}

export function validateStep(step: QuestStep, answer: string): boolean {
  return normalizeAnswer(step.answer) === normalizeAnswer(answer);
}

export function getQuestStatus(
  quest: Quest,
  xp: number,
  completedQuestIds: string[],
): QuestStatus {
  if (completedQuestIds.includes(quest.id)) {
    return "completed";
  }

  if (getLevelFromXp(xp) < quest.requiredLevel) {
    return "locked";
  }

  return "available";
}

export function isQuestLocked(quest: Quest, xp: number): boolean {
  return getQuestStatus(quest, xp, []) === "locked";
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
    return "完成指定任务后解锁";
  }
  return `完成 ${questTitleCn} 任务后解锁`;
}
