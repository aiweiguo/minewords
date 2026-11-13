import type { GameState } from "@/types";
import {
  getEquippedWeapon,
  getHomeFillProgress,
} from "@/lib/weaponGoal";

/** Compact progress card for import preview + save-slot rows (MW-59). */
export type ProgressSummary = {
  playerName: string;
  level: number;
  xp: number;
  weaponLabelCn: string;
  homeFilled: number;
  homeTotal: number;
  homeFillLabelCn: string;
};

export function summarizeProgress(
  state: Partial<GameState> | null | undefined,
): ProgressSummary {
  const xp = typeof state?.xp === "number" && Number.isFinite(state.xp) ? state.xp : 0;
  const level = Math.floor(xp / 100) + 1;
  const playerName =
    typeof state?.playerName === "string" && state.playerName.trim().length > 0
      ? state.playerName.trim().slice(0, 24)
      : "Alex";
  const unlockedIds = Array.isArray(state?.unlockedIds) ? state.unlockedIds : [];
  const equipped = getEquippedWeapon(unlockedIds);
  const home = getHomeFillProgress(state?.roomBlocks ?? {});

  return {
    playerName,
    level,
    xp,
    weaponLabelCn: equipped ? equipped.nameCn : "尚未挂剑",
    homeFilled: home.filled,
    homeTotal: home.total,
    homeFillLabelCn: `${home.filled}/${home.total}`,
  };
}

export function formatProgressSummaryLines(summary: ProgressSummary): string[] {
  return [
    `称呼：${summary.playerName}`,
    `等级：Lv ${summary.level}`,
    `武器：${summary.weaponLabelCn}`,
    `家装：${summary.homeFillLabelCn}`,
  ];
}
