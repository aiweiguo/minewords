import { XP_PER_LEVEL } from "@/data/rewards";

export function getLevelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getXpProgress(xp: number): {
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  percent: number;
} {
  const level = getLevelFromXp(xp);
  const currentLevelXp = xp % XP_PER_LEVEL;
  const xpForNextLevel = XP_PER_LEVEL;
  const percent = Math.round((currentLevelXp / xpForNextLevel) * 100);

  return { level, currentLevelXp, xpForNextLevel, percent };
}
