import {
  DailyAdventureActionKind,
  DailyAdventurePlan,
  DailySpeakLoopCounts,
} from "@/types";

export const EMPTY_SPEAK_LOOP: DailySpeakLoopCounts = {
  fight: 0,
  craft: 0,
  trade: 0,
  home: 0,
};

export function normalizeSpeakLoop(
  raw?: Partial<DailySpeakLoopCounts> | null,
): DailySpeakLoopCounts {
  return {
    fight: raw?.fight ?? 0,
    craft: raw?.craft ?? 0,
    trade: raw?.trade ?? 0,
    home: raw?.home ?? 0,
  };
}

export function bumpSpeakLoop(
  counts: DailySpeakLoopCounts,
  kind: DailyAdventureActionKind,
): DailySpeakLoopCounts {
  const base = normalizeSpeakLoop(counts);
  return {
    ...base,
    [kind]: base[kind] + 1,
  };
}

const ACTION_LABEL_CN: Record<DailyAdventureActionKind, string> = {
  fight: "开口打怪",
  craft: "开口合成",
  trade: "开口交易",
  home: "铺一块家",
};

export type DailyAdventureClaimCheck = {
  ok: boolean;
  reason: string;
  progress: number;
  needed: number;
};

/**
 * Claim unlocks only via today's speak/play action counts.
 * Guide quiz / completedGuideIds are intentionally ignored (MW-54).
 */
export function canClaimDailyAdventure(
  plan: DailyAdventurePlan,
  speakLoop: Partial<DailySpeakLoopCounts> | undefined,
): DailyAdventureClaimCheck {
  const counts = normalizeSpeakLoop(speakLoop);
  const needed = Math.max(1, plan.actionCount || 1);
  const progress = counts[plan.actionKind] ?? 0;

  if (progress >= needed) {
    return { ok: true, reason: "", progress, needed };
  }

  const label = ACTION_LABEL_CN[plan.actionKind];
  return {
    ok: false,
    reason: `先${label} ${needed} 次再领奖（已完成 ${progress}/${needed}）。攻略小测验不挡领取。`,
    progress,
    needed,
  };
}
