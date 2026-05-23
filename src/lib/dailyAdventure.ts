import { guides } from "@/data/guides";
import { quests } from "@/data/quests";
import { vocabulary } from "@/data/vocabulary";
import { getTodayDateString } from "@/lib/date";
import { DailyAdventurePlan, Reward } from "@/types";

const adventureTemplates: Omit<DailyAdventurePlan, "id">[] = [
  {
    title: "Explore the Cave",
    titleCn: "探索洞穴",
    descriptionCn: "今天学会洞穴相关单词，并完成一个小测验。",
    wordIds: ["cave", "stone", "coal", "iron", "torch"],
    questId: "mine-stone",
    guideId: "mining-basics",
    rewards: [
      { type: "resource", resource: "iron", amount: 2 },
      { type: "resource", resource: "stone", amount: 5 },
      { type: "xp", xp: 15 },
    ],
  },
  {
    title: "Diamond Hunt",
    titleCn: "钻石探险",
    descriptionCn: "学习钻石和挖矿词汇，向深层进发！",
    wordIds: ["diamond", "pickaxe", "deep", "rare", "mine"],
    questId: "find-diamond",
    guideId: "find-diamond",
    rewards: [
      { type: "resource", resource: "diamond", amount: 1 },
      { type: "xp", xp: 20 },
    ],
  },
  {
    title: "Forest Starter",
    titleCn: "森林起步",
    descriptionCn: "收集木头，学习森林基础词。",
    wordIds: ["wood", "tree", "plank", "stick", "craft"],
    questId: "collect-wood",
    guideId: "survive-first-night",
    rewards: [
      { type: "resource", resource: "wood", amount: 8 },
      { type: "xp", xp: 10 },
    ],
  },
  {
    title: "Fight at Night",
    titleCn: "夜晚战斗",
    descriptionCn: "学习怪物和战斗词汇。",
    wordIds: ["zombie", "sword", "fight", "night", "monster"],
    questId: "fight-a-zombie",
    guideId: "fight-zombie",
    rewards: [
      { type: "resource", resource: "iron", amount: 1 },
      { type: "xp", xp: 15 },
    ],
  },
  {
    title: "Village Trade",
    titleCn: "村庄交易",
    descriptionCn: "找到村庄，学习交易词汇。",
    wordIds: ["village", "villager", "emerald", "trade", "bread"],
    guideId: "villager-trade",
    rewards: [
      { type: "resource", resource: "emerald", amount: 2 },
      { type: "xp", xp: 15 },
    ],
  },
  {
    title: "Redstone Lab",
    titleCn: "红石实验室",
    descriptionCn: "入门红石，学习按钮和门。",
    wordIds: ["redstone", "button", "door", "lever", "craft"],
    guideId: "redstone-door",
    rewards: [
      { type: "resource", resource: "iron", amount: 2 },
      { type: "xp", xp: 20 },
    ],
  },
  {
    title: "Farm Life",
    titleCn: "农场生活",
    descriptionCn: "学习农场和食物单词。",
    wordIds: ["farm", "wheat", "carrot", "bread", "seed"],
    rewards: [
      { type: "resource", resource: "wood", amount: 5 },
      { type: "xp", xp: 12 },
    ],
  },
  {
    title: "Craft a Sword",
    titleCn: "合成利剑",
    descriptionCn: "学习剑和合成相关词。",
    wordIds: ["sword", "diamond", "stick", "craft", "iron"],
    questId: "craft-diamond-sword",
    guideId: "diamond-sword-guide",
    rewards: [
      { type: "resource", resource: "emerald", amount: 1 },
      { type: "xp", xp: 25 },
    ],
  },
];

function hashDate(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i += 1) {
    hash = (hash * 31 + date.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getDailyAdventure(date: string): DailyAdventurePlan {
  const index = hashDate(date) % adventureTemplates.length;
  const template = adventureTemplates[index];
  return {
    id: `daily-${date}-${index}`,
    ...template,
    wordIds: template.wordIds.filter((id) =>
      vocabulary.some((word) => word.id === id),
    ),
    questId: template.questId && quests.some((q) => q.id === template.questId)
      ? template.questId
      : undefined,
    guideId: template.guideId && guides.some((g) => g.id === template.guideId)
      ? template.guideId
      : undefined,
  };
}

export { getTodayDateString };

export function formatDailyRewards(rewards: Reward[]): string {
  return rewards
    .map((r) => {
      if (r.type === "resource" && r.resource) {
        return `${r.resource} x${r.amount}`;
      }
      if (r.type === "xp") return `XP +${r.xp}`;
      return "";
    })
    .filter(Boolean)
    .join(", ");
}
