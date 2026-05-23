import { baseDecorations, isDecorationUnlocked } from "@/data/baseDecorations";
import { unlockables } from "@/data/unlockables";

export function getDecorationUnlockIds(
  learnedWordIds: string[],
  masteredWordIds: string[],
  currentUnlockedIds: string[],
): string[] {
  const next = [...currentUnlockedIds];

  for (const decoration of baseDecorations) {
    if (!isDecorationUnlocked(decoration, learnedWordIds, masteredWordIds)) {
      continue;
    }
    const unlockable = unlockables.find((item) => item.id === decoration.id);
    if (unlockable && !next.includes(unlockable.id)) {
      next.push(unlockable.id);
    }
  }

  return next;
}

export function getDecorationUnlockHint(unlockId: string): string | undefined {
  const unlockable = unlockables.find((item) => item.id === unlockId);
  if (!unlockable?.requiredWordIds?.length) {
    return undefined;
  }
  const decoration = baseDecorations.find((item) => item.id === unlockId);
  if (!decoration) {
    return undefined;
  }
  return `掌握 ${decoration.requiredWordIds.slice(0, 3).join("、")} 等 ${decoration.requiredCount} 个词后解锁`;
}
