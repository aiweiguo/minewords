import { Quest } from "@/types";
import { assetMap, backgroundMap } from "@/lib/assets";

/**
 * Material errands for the current weapon goal (MW-8).
 * Quiz-style quests are retired — these short gather/speak jobs feed craft.
 */
const errandData: Quest[] = [
  {
    id: "wood-fights-for-sword",
    title: "Fight for Wood",
    titleCn: "再打怪凑木头",
    description: "Speak-attack monsters twice to gather wood for a wooden sword.",
    descriptionCn: "再打 2 次怪，凑齐木头做木剑。",
    mapArea: "forest",
    difficulty: 1,
    requiredLevel: 1,
    coverImage: backgroundMap.forest,
    icon: assetMap.wood,
    themeColor: "#4F8A10",
    steps: [],
    errand: {
      weaponId: "wooden-sword",
      goal: { type: "defeat-monsters", amount: 2, resource: "wood" },
      nudge: "explore",
      exploreZoneId: "forest",
    },
    rewards: [
      { type: "resource", resource: "wood", amount: 2 },
      { type: "xp", xp: 8 },
    ],
  },
  {
    id: "gather-wood-for-sword",
    title: "Stock Wood",
    titleCn: "攒够木头",
    description: "Hold enough wood for the wooden sword recipe.",
    descriptionCn: "背包里攒到 3 个 wood，就能去做木剑。",
    mapArea: "forest",
    difficulty: 1,
    requiredLevel: 1,
    coverImage: backgroundMap.forest,
    icon: assetMap.wood,
    themeColor: "#6B8E23",
    steps: [],
    errand: {
      weaponId: "wooden-sword",
      goal: { type: "gather-resource", resource: "wood", amount: 3 },
      nudge: "craft",
      exploreZoneId: "forest",
    },
    rewards: [
      { type: "resource", resource: "wood", amount: 1 },
      { type: "xp", xp: 6 },
    ],
  },
  {
    id: "craft-wooden-sword-errand",
    title: "Craft Wooden Sword",
    titleCn: "去合成木剑",
    description: "When mats are ready, speak-craft the wooden sword at the bench.",
    descriptionCn: "材料够了就回工作台，开口合成木剑。",
    mapArea: "battle",
    difficulty: 1,
    requiredLevel: 1,
    coverImage: backgroundMap.battle,
    icon: assetMap.sword,
    themeColor: "#8B5E34",
    steps: [],
    errand: {
      weaponId: "wooden-sword",
      goal: { type: "craft-weapon", weaponId: "wooden-sword" },
      nudge: "craft",
    },
    rewards: [{ type: "xp", xp: 5 }],
  },
  {
    id: "stone-fights-for-sword",
    title: "Fight for Stone",
    titleCn: "再打怪凑石头",
    description: "Speak-attack cave monsters three times for stone-sword mats.",
    descriptionCn: "再打 3 次怪，凑齐石头做石剑。",
    mapArea: "cave",
    difficulty: 2,
    requiredLevel: 1,
    coverImage: backgroundMap.cave,
    icon: assetMap.stone,
    themeColor: "#64748B",
    steps: [],
    errand: {
      weaponId: "stone-sword",
      goal: { type: "defeat-monsters", amount: 3, resource: "stone" },
      nudge: "explore",
      exploreZoneId: "cave",
    },
    rewards: [
      { type: "resource", resource: "stone", amount: 2 },
      { type: "xp", xp: 10 },
    ],
  },
  {
    id: "gather-stone-for-sword",
    title: "Stock Stone",
    titleCn: "攒够石头",
    description: "Hold enough stone (and a stick of wood) for the stone sword.",
    descriptionCn: "背包攒到 3 个 stone，再留 1 个 wood，去做石剑。",
    mapArea: "cave",
    difficulty: 2,
    requiredLevel: 1,
    coverImage: backgroundMap.cave,
    icon: assetMap.stone,
    themeColor: "#475569",
    steps: [],
    errand: {
      weaponId: "stone-sword",
      goal: { type: "gather-resource", resource: "stone", amount: 3 },
      nudge: "craft",
      exploreZoneId: "cave",
    },
    rewards: [
      { type: "resource", resource: "stone", amount: 1 },
      { type: "resource", resource: "wood", amount: 1 },
      { type: "xp", xp: 8 },
    ],
  },
  {
    id: "craft-stone-sword-errand",
    title: "Craft Stone Sword",
    titleCn: "去合成石剑",
    description: "Speak-craft the stone sword once mats are ready.",
    descriptionCn: "材料够了就开口合成石剑，挂上武器架。",
    mapArea: "battle",
    difficulty: 2,
    requiredLevel: 1,
    coverImage: backgroundMap.battle,
    icon: assetMap.sword,
    themeColor: "#334155",
    steps: [],
    errand: {
      weaponId: "stone-sword",
      goal: { type: "craft-weapon", weaponId: "stone-sword" },
      nudge: "craft",
    },
    rewards: [{ type: "xp", xp: 8 }],
  },
];

export const quests: Quest[] = errandData;

export function getQuestById(id: string): Quest | undefined {
  return quests.find((quest) => quest.id === id);
}

export function getErrandsForWeapon(weaponId: string): Quest[] {
  return quests.filter((quest) => quest.errand?.weaponId === weaponId);
}

export const mapAreaLabels: Record<string, { en: string; cn: string }> = {
  forest: { en: "Forest", cn: "森林" },
  cave: { en: "Cave", cn: "洞穴" },
  battle: { en: "Craft Bench", cn: "工作台" },
  village: { en: "Village", cn: "村庄" },
  nether: { en: "Nether", cn: "下界" },
  end: { en: "The End", cn: "末地" },
};
