import { MaterialPlan } from "@/types";

export const materialPlans: MaterialPlan[] = [
  {
    id: "diamond-sword-x1",
    title: "1 Diamond Sword",
    titleCn: "1 把钻石剑",
    descriptionCn: "合成一把钻石剑需要的材料。",
    simpleEnglish: "You need two diamonds and one stick.",
    items: [
      { itemId: "diamond", english: "Diamond", chinese: "钻石", amount: 2 },
      { itemId: "stick", english: "Stick", chinese: "木棍", amount: 1 },
    ],
    keywordIds: ["diamond", "sword", "stick"],
    queryAliases: ["钻石剑", "diamond sword", "做钻石剑"],
  },
  {
    id: "diamond-sword-x3",
    title: "3 Diamond Swords",
    titleCn: "3 把钻石剑",
    descriptionCn: "做三把钻石剑（比如和朋友一起玩）。",
    simpleEnglish: "You need six diamonds and three sticks.",
    items: [
      { itemId: "diamond", english: "Diamond", chinese: "钻石", amount: 6 },
      { itemId: "stick", english: "Stick", chinese: "木棍", amount: 3 },
    ],
    keywordIds: ["diamond", "sword", "stick"],
    queryAliases: ["三把钻石剑", "3把钻石剑", "3 diamond swords"],
  },
  {
    id: "torch-x16",
    title: "16 Torches",
    titleCn: "16 个火把",
    descriptionCn: "探索洞穴常用的火把数量。",
    simpleEnglish: "You need eight coal and eight sticks.",
    items: [
      { itemId: "coal", english: "Coal", chinese: "煤", amount: 8 },
      { itemId: "stick", english: "Stick", chinese: "木棍", amount: 8 },
    ],
    keywordIds: ["torch", "coal", "stick", "light"],
    queryAliases: ["火把", "torch", "16个火把", "16火把"],
  },
  {
    id: "small-house",
    title: "Small House",
    titleCn: "小房子",
    descriptionCn: "建一个安全小房子的基础材料估算。",
    simpleEnglish: "You need oak planks, glass, a door, torches, and a bed.",
    items: [
      { itemId: "plank", english: "Plank", chinese: "木板", amount: 64 },
      { itemId: "glass", english: "Glass", chinese: "玻璃", amount: 12 },
      { itemId: "door", english: "Door", chinese: "门", amount: 1 },
      { itemId: "torch", english: "Torch", chinese: "火把", amount: 8 },
      { itemId: "bed", english: "Bed", chinese: "床", amount: 1 },
    ],
    keywordIds: ["build", "plank", "door", "bed", "shelter"],
    queryAliases: ["小房子", "房子", "house", "建房子", "small house"],
  },
  {
    id: "iron-pickaxe-x1",
    title: "1 Iron Pickaxe",
    titleCn: "1 把铁镐",
    descriptionCn: "挖钻石必备铁镐。",
    simpleEnglish: "You need three iron ingots and two sticks.",
    items: [
      { itemId: "iron", english: "Iron", chinese: "铁", amount: 3 },
      { itemId: "stick", english: "Stick", chinese: "木棍", amount: 2 },
    ],
    keywordIds: ["iron", "pickaxe", "stick"],
    queryAliases: ["铁镐", "iron pickaxe", "做铁镐"],
  },
  {
    id: "bed-x1",
    title: "1 Bed",
    titleCn: "1 张床",
    descriptionCn: "度过第一晚必备。",
    simpleEnglish: "You need three wool and three planks.",
    items: [
      { itemId: "wool", english: "Wool", chinese: "羊毛", amount: 3 },
      { itemId: "plank", english: "Plank", chinese: "木板", amount: 3 },
    ],
    keywordIds: ["wool", "plank", "bed", "sleep"],
    queryAliases: ["床", "bed", "做床", "一张床"],
  },
];

export function getMaterialPlanById(id: string): MaterialPlan | undefined {
  return materialPlans.find((plan) => plan.id === id);
}

export function scaleMaterialPlan(plan: MaterialPlan, multiplier: number): MaterialPlan {
  return {
    ...plan,
    id: `${plan.id}-scaled-${multiplier}`,
    title: `${multiplier}× ${plan.title}`,
    titleCn: `${multiplier}× ${plan.titleCn}`,
    items: plan.items.map((item) => ({
      ...item,
      amount: item.amount * multiplier,
    })),
    simpleEnglish: plan.simpleEnglish.replace(/\d+/g, (n) =>
      String(Number(n) * multiplier),
    ),
  };
}
