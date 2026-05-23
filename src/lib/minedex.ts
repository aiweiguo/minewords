import { VocabularyItem, MineDexStatus } from "@/types";

export const minedexCategoryLabels: Record<
  string,
  { en: string; cn: string; emoji: string }
> = {
  block: { en: "Blocks", cn: "方块", emoji: "🧱" },
  tool: { en: "Tools", cn: "工具", emoji: "⛏️" },
  weapon: { en: "Weapons", cn: "武器", emoji: "⚔️" },
  mob: { en: "Mobs", cn: "生物", emoji: "🐷" },
  food: { en: "Food", cn: "食物", emoji: "🍎" },
  ore: { en: "Ores", cn: "矿物", emoji: "💎" },
  armor: { en: "Armor", cn: "盔甲", emoji: "🛡️" },
  crafting: { en: "Crafting", cn: "合成", emoji: "🔨" },
  biome: { en: "Biomes", cn: "生物群系", emoji: "🌲" },
  action: { en: "Actions", cn: "动作", emoji: "🏃" },
};

export const minedexStatusLabels: Record<
  MineDexStatus,
  { cn: string; color: string }
> = {
  undiscovered: { cn: "未发现", color: "text-gray-500 bg-gray-100" },
  discovered: { cn: "已发现", color: "text-blue-700 bg-blue-100" },
  learned: { cn: "已学习", color: "text-green-700 bg-green-100" },
  mastered: { cn: "已掌握", color: "text-amber-800 bg-amber-100" },
};

export function getMineDexStatus(
  wordId: string,
  discoveredWordIds: string[],
  learnedWordIds: string[],
  masteredWordIds: string[],
): MineDexStatus {
  if (masteredWordIds.includes(wordId)) return "mastered";
  if (learnedWordIds.includes(wordId)) return "learned";
  if (discoveredWordIds.includes(wordId)) return "discovered";
  return "undiscovered";
}

export function filterMineDex(
  items: VocabularyItem[],
  query: string,
  category?: string,
  statusFilter?: MineDexStatus | "all",
  discoveredWordIds: string[] = [],
  learnedWordIds: string[] = [],
  masteredWordIds: string[] = [],
) {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    if (category && category !== "all" && item.category !== category) {
      return false;
    }
    const status = getMineDexStatus(
      item.id,
      discoveredWordIds,
      learnedWordIds,
      masteredWordIds,
    );
    if (statusFilter && statusFilter !== "all" && status !== statusFilter) {
      return false;
    }
    if (!q) return true;
    const haystack = [item.english, item.chinese, ...item.tags].join(" ").toLowerCase();
    return haystack.includes(q);
  });
}

export function countMineDexByStatus(
  items: VocabularyItem[],
  discoveredWordIds: string[],
  learnedWordIds: string[],
  masteredWordIds: string[],
) {
  const counts: Record<MineDexStatus, number> = {
    undiscovered: 0,
    discovered: 0,
    learned: 0,
    mastered: 0,
  };
  for (const item of items) {
    const status = getMineDexStatus(
      item.id,
      discoveredWordIds,
      learnedWordIds,
      masteredWordIds,
    );
    counts[status] += 1;
  }
  return counts;
}
