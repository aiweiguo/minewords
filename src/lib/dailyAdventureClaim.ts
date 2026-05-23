import { DailyAdventurePlan } from "@/types";

export function canClaimDailyAdventure(
  plan: DailyAdventurePlan,
  completedQuestIds: string[],
  completedGuideIds: string[],
): { ok: boolean; reason: string } {
  const questDone = plan.questId ? completedQuestIds.includes(plan.questId) : false;
  const guideDone = plan.guideId ? completedGuideIds.includes(plan.guideId) : false;

  if (plan.questId && plan.guideId) {
    if (questDone || guideDone) {
      return { ok: true, reason: "" };
    }
    return {
      ok: false,
      reason: "请先完成今日冒险的关联任务或攻略小测验，再领取奖励。",
    };
  }

  if (plan.questId) {
    if (questDone) return { ok: true, reason: "" };
    return { ok: false, reason: "请先完成上方关联任务，再领取今日冒险奖励。" };
  }

  if (plan.guideId) {
    if (guideDone) return { ok: true, reason: "" };
    return { ok: false, reason: "请先完成上方关联攻略小测验，再领取今日冒险奖励。" };
  }

  return {
    ok: false,
    reason: "今日冒险暂无关联内容，请稍后再试。",
  };
}
