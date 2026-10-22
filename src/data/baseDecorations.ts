import { BaseDecoration } from "@/types";

export const baseDecorations: BaseDecoration[] = [
  {
    id: "deco-torch",
    name: "Torch Light",
    nameCn: "火把照明",
    emoji: "🔥",
    description: "掌握 torch、light 后点亮基地。",
    requiredWordIds: ["torch", "light"],
    requiredCount: 2,
  },
  {
    id: "deco-bed",
    name: "Cozy Bed",
    nameCn: "温暖小床",
    emoji: "🛏️",
    description: "学会 bed、sleep 后放置床铺。",
    requiredWordIds: ["bed", "sleep"],
    requiredCount: 2,
  },
  {
    id: "deco-crafting",
    name: "Crafting Corner",
    nameCn: "合成角落",
    emoji: "🔨",
    description: "掌握 craft、plank、stick。",
    requiredWordIds: ["craft", "plank", "stick"],
    requiredCount: 3,
  },
  {
    id: "deco-farm",
    name: "Mini Farm",
    nameCn: "迷你农场",
    emoji: "🌾",
    description: "掌握 farm、wheat、carrot。",
    requiredWordIds: ["farm", "wheat", "carrot"],
    requiredCount: 3,
  },
  {
    id: "deco-dog-house",
    name: "Wolf House",
    nameCn: "狼窝",
    emoji: "🐺",
    description: "掌握 wolf、tame、friend。",
    requiredWordIds: ["wolf", "tame", "friend"],
    requiredCount: 3,
  },
  {
    id: "deco-enchant",
    name: "Enchant Table",
    nameCn: "附魔台",
    emoji: "✨",
    description: "掌握 enchant、diamond、book。",
    requiredWordIds: ["enchant", "diamond", "book"],
    requiredCount: 3,
  },
  {
    id: "deco-chest",
    name: "Storage Chest",
    nameCn: "储物箱",
    emoji: "📦",
    description: "掌握 chest、craft。",
    requiredWordIds: ["chest", "craft"],
    requiredCount: 2,
  },
  {
    id: "deco-redstone",
    name: "Redstone Lamp",
    nameCn: "红石灯",
    emoji: "💡",
    description: "掌握 redstone、button、door。",
    requiredWordIds: ["redstone", "button", "door"],
    requiredCount: 3,
  },
  {
    id: "deco-ocean",
    name: "Ocean Dock",
    nameCn: "海边码头",
    emoji: "🌊",
    description: "掌握 ocean、boat、swim。",
    requiredWordIds: ["ocean", "boat", "swim"],
    requiredCount: 3,
  },
  {
    id: "deco-nether",
    name: "Portal Frame",
    nameCn: "传送门框",
    emoji: "🌀",
    description: "掌握 portal、obsidian、nether。",
    requiredWordIds: ["portal", "obsidian", "nether"],
    requiredCount: 3,
  },
];

export function isDecorationUnlocked(
  decoration: BaseDecoration,
  learnedWordIds: string[],
  masteredWordIds: string[],
): boolean {
  const known = new Set([...learnedWordIds, ...masteredWordIds]);
  const matched = decoration.requiredWordIds.filter((id) => known.has(id)).length;
  return matched >= decoration.requiredCount;
}
