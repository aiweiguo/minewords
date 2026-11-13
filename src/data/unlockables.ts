import { Unlockable } from "@/types";
import { baseDecorations } from "@/data/baseDecorations";
import { assetMap, backgroundMap, getUnlockableImage } from "@/lib/assets";

const decorationUnlockables: Unlockable[] = baseDecorations.map((deco) => ({
  id: deco.id,
  type: "decoration",
  name: deco.name,
  nameCn: deco.nameCn,
  description: deco.description,
  icon: deco.emoji,
  rarity: "uncommon",
  requiredWordIds: deco.requiredWordIds,
  requiredCount: deco.requiredCount,
}));

/**
 * Unlock catalog aligned to live errands / weapons / trade (MW-39).
 * Dead quest ids (trade-at-village, start-a-farm, nether/end) removed.
 * Weapons unlock via speak-craft; titles/maps via errand claim or trade.
 */
export const unlockables: Unlockable[] = [
  {
    id: "wooden-sword",
    type: "equipment",
    name: "Wooden Sword",
    nameCn: "木剑",
    description:
      "A basic sword for beginners. Craft it by speaking wood / stick / craft.",
    icon: assetMap.sword,
    rarity: "common",
    questId: "craft-wooden-sword-errand",
    unlockHintCn: "开口合成木剑后解锁",
  },
  {
    id: "stone-sword",
    type: "equipment",
    name: "Stone Sword",
    nameCn: "石剑",
    description: "A stronger sword. Craft it by saying stone sword.",
    icon: assetMap.sword,
    rarity: "uncommon",
    questId: "craft-stone-sword-errand",
    unlockHintCn: "开口合成石剑后解锁",
  },
  {
    id: "iron-sword",
    type: "equipment",
    name: "Iron Sword",
    nameCn: "铁剑",
    description:
      "A stronger blade for harder zones. Craft it by saying I craft an iron sword.",
    icon: assetMap.sword,
    rarity: "rare",
    questId: "craft-iron-sword-errand",
    unlockHintCn: "开口合成铁剑后解锁",
  },
  {
    id: "diamond-sword",
    type: "equipment",
    name: "Diamond Sword",
    nameCn: "钻石剑",
    description:
      "A legendary blade. Craft it by saying Can I craft a diamond sword?",
    icon: assetMap.sword,
    image: assetMap.diamond,
    rarity: "legendary",
    questId: "craft-diamond-sword-errand",
    unlockHintCn: "开口合成钻石剑后解锁",
  },
  {
    id: "word-miner",
    type: "title",
    name: "Word Miner",
    nameCn: "单词矿工",
    description: "Stock enough wood for the wooden sword.",
    icon: assetMap.pickaxe,
    rarity: "uncommon",
    questId: "gather-wood-for-sword",
  },
  {
    id: "zombie-fighter",
    type: "title",
    name: "Zombie Fighter",
    nameCn: "僵尸战士",
    description: "Defeat monsters while gathering wood.",
    icon: assetMap.zombie,
    rarity: "rare",
    questId: "wood-fights-for-sword",
  },
  {
    id: "bed-builder",
    type: "title",
    name: "Bed Builder",
    nameCn: "床铺建造师",
    description: "Finish the wood gather errand for the wooden sword.",
    icon: assetMap.chest,
    rarity: "common",
    questId: "gather-wood-for-sword",
  },
  {
    id: "village-trader",
    type: "title",
    name: "Village Trader",
    nameCn: "村庄商人",
    description: "Complete a speak-trade with a villager.",
    icon: assetMap.emerald,
    rarity: "uncommon",
    unlockHintCn: "完成一次村民交易后解锁",
  },
  {
    id: "diamond-speaker",
    type: "title",
    name: "Diamond Speaker",
    nameCn: "钻石口语者",
    description: "Speak-craft the diamond sword.",
    icon: assetMap.diamond,
    rarity: "epic",
    questId: "craft-diamond-sword-errand",
    unlockHintCn: "开口合成钻石剑后解锁",
  },
  {
    id: "forest-map",
    type: "map",
    name: "Forest",
    nameCn: "森林",
    description: "Explore the green forest area.",
    icon: backgroundMap.forest,
    rarity: "common",
    questId: "wood-fights-for-sword",
  },
  {
    id: "cave-map",
    type: "map",
    name: "Cave",
    nameCn: "洞穴",
    description: "Mine deep inside the cave.",
    icon: backgroundMap.cave,
    rarity: "uncommon",
    questId: "stone-fights-for-sword",
  },
  {
    id: "mines-map",
    type: "map",
    name: "Deep Mines",
    nameCn: "深层矿洞",
    description: "Fight for iron in the deep mines.",
    icon: backgroundMap.mines,
    rarity: "rare",
    questId: "iron-fights-for-sword",
  },
  {
    id: "crystal-map",
    type: "map",
    name: "Crystal Depths",
    nameCn: "钻石矿脉",
    description: "Fight for diamond in the crystal depths.",
    icon: backgroundMap.crystal,
    rarity: "legendary",
    questId: "crystal-fights-for-sword",
  },
  {
    id: "village-map",
    type: "map",
    name: "Village",
    nameCn: "村庄",
    description: "Visit the friendly village and trade.",
    icon: backgroundMap.village,
    rarity: "uncommon",
    unlockHintCn: "完成一次村民交易后解锁",
  },
  ...decorationUnlockables,
].map((item) => ({
  ...item,
  image: item.image ?? getUnlockableImage(item.id),
})) as Unlockable[];

export function getUnlockableById(id: string): Unlockable | undefined {
  return unlockables.find((item) => item.id === id);
}

export function getUnlockableByQuestId(questId: string): Unlockable[] {
  return unlockables.filter((item) => item.questId === questId);
}
