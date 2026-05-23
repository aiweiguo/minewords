import { Unlockable } from "@/types";

export const unlockables: Unlockable[] = [
  {
    id: "wooden-axe",
    type: "equipment",
    name: "Wooden Axe",
    nameCn: "木斧",
    description: "Your first tool for chopping wood.",
    icon: "🪓",
    questId: "collect-wood",
  },
  {
    id: "stone-pickaxe",
    type: "equipment",
    name: "Stone Pickaxe",
    nameCn: "石镐",
    description: "Use it to mine stone in caves.",
    icon: "⛏️",
    questId: "mine-stone",
  },
  {
    id: "iron-sword",
    type: "equipment",
    name: "Iron Sword",
    nameCn: "铁剑",
    description: "A stronger weapon for battle.",
    icon: "🗡️",
    questId: "find-iron",
  },
  {
    id: "diamond-sword",
    type: "equipment",
    name: "Diamond Sword",
    nameCn: "钻石剑",
    description: "A strong weapon made of diamond.",
    icon: "⚔️",
    questId: "craft-diamond-sword",
  },
  {
    id: "word-miner",
    type: "title",
    name: "Word Miner",
    nameCn: "单词矿工",
    description: "Learn 20 Minecraft words.",
    icon: "🏅",
    questId: "make-planks",
  },
  {
    id: "diamond-speaker",
    type: "title",
    name: "Diamond Speaker",
    nameCn: "钻石口语者",
    description: "Complete the diamond sword quest.",
    icon: "💎",
    questId: "craft-diamond-sword",
  },
  {
    id: "forest-map",
    type: "map",
    name: "Forest",
    nameCn: "森林",
    description: "Explore the green forest area.",
    icon: "🌲",
    questId: "collect-wood",
  },
  {
    id: "cave-map",
    type: "map",
    name: "Cave",
    nameCn: "洞穴",
    description: "Mine deep inside the cave.",
    icon: "🕳️",
    questId: "mine-stone",
  },
  {
    id: "village-map",
    type: "map",
    name: "Village",
    nameCn: "村庄",
    description: "Visit the friendly village.",
    icon: "🏘️",
    questId: "build-a-bed",
  },
  {
    id: "bed-builder",
    type: "title",
    name: "Bed Builder",
    nameCn: "床铺建造师",
    description: "Learn how to build a bed.",
    icon: "🛏️",
    questId: "build-a-bed",
  },
  {
    id: "zombie-fighter",
    type: "title",
    name: "Zombie Fighter",
    nameCn: "僵尸战士",
    description: "Defeat zombies in battle.",
    icon: "🧟",
    questId: "fight-a-zombie",
  },
  {
    id: "wooden-sword",
    type: "equipment",
    name: "Wooden Sword",
    nameCn: "木剑",
    description: "A basic sword for beginners.",
    icon: "🗡️",
    questId: "fight-a-zombie",
  },
];

export function getUnlockableById(id: string): Unlockable | undefined {
  return unlockables.find((item) => item.id === id);
}

export function getUnlockableByQuestId(questId: string): Unlockable[] {
  return unlockables.filter((item) => item.questId === questId);
}
