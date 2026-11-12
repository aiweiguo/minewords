import { guides } from "@/data/guides";
import { quests } from "@/data/quests";
import { vocabulary } from "@/data/vocabulary";
import { getTodayDateString } from "@/lib/date";
import { DailyAdventurePlan, Reward } from "@/types";

const adventureTemplates: Omit<DailyAdventurePlan, "id">[] = [
  {
    title: "Forest Wood Run",
    titleCn: "森林攒木",
    descriptionCn: "开口打怪攒木头，推进木剑委托。",
    wordIds: ["wood", "tree", "plank", "stick", "craft"],
    questId: "wood-fights-for-sword",
    guideId: "survive-first-night",
    rewards: [
      { type: "resource", resource: "wood", amount: 3 },
      { type: "xp", xp: 10 },
    ],
  },
  {
    title: "Craft the Wooden Sword",
    titleCn: "合成木剑日",
    descriptionCn: "材料够了就去工作台开口合成木剑。",
    wordIds: ["sword", "wood", "stick", "craft", "attack"],
    questId: "craft-wooden-sword-errand",
    rewards: [
      { type: "resource", resource: "wood", amount: 2 },
      { type: "xp", xp: 12 },
    ],
  },
  {
    title: "Cave Stone Run",
    titleCn: "洞穴攒石",
    descriptionCn: "进洞穴打怪，为石剑凑石头。",
    wordIds: ["stone", "cave", "mine", "pickaxe", "skeleton"],
    questId: "stone-fights-for-sword",
    guideId: "mining-basics",
    rewards: [
      { type: "resource", resource: "stone", amount: 3 },
      { type: "xp", xp: 12 },
    ],
  },
  {
    title: "Stock Stone Mats",
    titleCn: "攒齐石剑材料",
    descriptionCn: "背包攒够 stone，再去合成石剑。",
    wordIds: ["stone", "sword", "craft", "wood", "cave"],
    questId: "gather-stone-for-sword",
    rewards: [
      { type: "resource", resource: "stone", amount: 2 },
      { type: "resource", resource: "wood", amount: 1 },
      { type: "xp", xp: 12 },
    ],
  },
  {
    title: "Fight at Night",
    titleCn: "夜晚战斗",
    descriptionCn: "多开口打怪，喂当前武器目标。",
    wordIds: ["zombie", "sword", "fight", "night", "monster"],
    questId: "wood-fights-for-sword",
    guideId: "fight-zombie",
    rewards: [
      { type: "resource", resource: "wood", amount: 2 },
      { type: "xp", xp: 10 },
    ],
  },
  {
    title: "Speak to Craft",
    titleCn: "开口合成",
    descriptionCn: "回到工作台，用语音合成当前武器。",
    wordIds: ["craft", "sword", "wood", "stone", "stick"],
    questId: "gather-wood-for-sword",
    rewards: [
      { type: "resource", resource: "wood", amount: 2 },
      { type: "xp", xp: 10 },
    ],
  },
  {
    title: "Farm Words",
    titleCn: "农场词汇",
    descriptionCn: "顺便学学农场词；武装主线仍优先。",
    wordIds: ["farm", "wheat", "carrot", "bread", "seed"],
    guideId: "redstone-door",
    rewards: [
      { type: "resource", resource: "wood", amount: 3 },
      { type: "xp", xp: 8 },
    ],
  },
  {
    title: "Stone Sword Day",
    titleCn: "石剑日",
    descriptionCn: "推进石剑委托：打怪、攒材料、合成。",
    wordIds: ["stone", "sword", "craft", "cave", "skeleton"],
    questId: "craft-stone-sword-errand",
    rewards: [
      { type: "resource", resource: "stone", amount: 2 },
      { type: "xp", xp: 15 },
    ],
  },
  {
    title: "Deep Mines Iron Run",
    titleCn: "矿洞攒铁",
    descriptionCn: "进深层矿洞打怪，为铁剑凑铁。",
    wordIds: ["iron", "mine", "craft", "sword", "blaze"],
    questId: "iron-fights-for-sword",
    guideId: "mining-basics",
    rewards: [
      { type: "resource", resource: "iron", amount: 3 },
      { type: "xp", xp: 14 },
    ],
  },
  {
    title: "Iron Sword Day",
    titleCn: "铁剑日",
    descriptionCn: "推进铁剑委托：打怪、攒材料、合成。",
    wordIds: ["iron", "sword", "craft", "mine", "stick"],
    questId: "craft-iron-sword-errand",
    rewards: [
      { type: "resource", resource: "iron", amount: 2 },
      { type: "xp", xp: 16 },
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
