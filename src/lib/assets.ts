import { MapArea, ResourceType } from "@/types";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export const assetMap = {
  wood: "/assets/icons/resources/wood.svg",
  stone: "/assets/icons/resources/stone.svg",
  iron: "/assets/icons/resources/iron.svg",
  emerald: "/assets/icons/resources/emerald.svg",
  diamond: "/assets/icons/resources/diamond.svg",
  sword: "/assets/icons/equipment/sword.svg",
  pickaxe: "/assets/icons/equipment/pickaxe.svg",
  axe: "/assets/icons/equipment/axe.svg",
  shield: "/assets/icons/equipment/shield.svg",
  zombie: "/assets/icons/mobs/zombie.svg",
  creeper: "/assets/icons/mobs/creeper-like.svg",
  skeleton: "/assets/icons/mobs/skeleton.svg",
  lock: "/assets/icons/ui/lock.svg",
  star: "/assets/icons/ui/star.svg",
  chest: "/assets/icons/ui/chest.svg",
} as const;

export const backgroundMap: Record<string, string> = {
  forest: "/assets/backgrounds/forest.svg",
  cave: "/assets/backgrounds/cave.svg",
  village: "/assets/backgrounds/village.svg",
  battle: "/assets/backgrounds/battle.svg",
  base: "/assets/backgrounds/base.svg",
};

export const uiAssetMap = {
  panel: "/assets/ui/panel.svg",
  button: "/assets/ui/button.svg",
  inventorySlot: "/assets/ui/inventory-slot.svg",
} as const;

export const resourceAssetMap: Record<ResourceType, string> = {
  wood: assetMap.wood,
  stone: assetMap.stone,
  iron: assetMap.iron,
  gold: assetMap.iron,
  emerald: assetMap.emerald,
  diamond: assetMap.diamond,
  netherite: assetMap.diamond,
};

export const mapAreaBackgrounds: Record<MapArea, string> = {
  forest: backgroundMap.forest,
  cave: backgroundMap.cave,
  village: backgroundMap.village,
  nether: backgroundMap.battle,
  end: backgroundMap.battle,
  battle: backgroundMap.battle,
};

export const rarityColors: Record<
  Rarity,
  { border: string; ring: string; bg: string; text: string; label: string }
> = {
  common: {
    border: "border-gray-400",
    ring: "ring-gray-400/50",
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: "普通",
  },
  uncommon: {
    border: "border-green-500",
    ring: "ring-green-500/50",
    bg: "bg-green-50",
    text: "text-green-800",
    label: "优秀",
  },
  rare: {
    border: "border-blue-500",
    ring: "ring-blue-500/50",
    bg: "bg-blue-50",
    text: "text-blue-800",
    label: "稀有",
  },
  epic: {
    border: "border-purple-500",
    ring: "ring-purple-500/50",
    bg: "bg-purple-50",
    text: "text-purple-800",
    label: "史诗",
  },
  legendary: {
    border: "border-amber-500",
    ring: "ring-amber-500/50",
    bg: "bg-gradient-to-br from-amber-50 to-orange-100",
    text: "text-amber-900",
    label: "传说",
  },
};

export const vocabularyIconMap: Record<string, string> = {
  wood: assetMap.wood,
  tree: assetMap.wood,
  stone: assetMap.stone,
  dirt: assetMap.stone,
  sand: assetMap.stone,
  glass: assetMap.emerald,
  door: assetMap.chest,
  bed: assetMap.chest,
  torch: assetMap.star,
  craft: assetMap.axe,
  stick: assetMap.wood,
  plank: assetMap.wood,
  "crafting-table": assetMap.axe,
  furnace: assetMap.iron,
  chest: assetMap.chest,
  pickaxe: assetMap.pickaxe,
  axe: assetMap.axe,
  shovel: assetMap.pickaxe,
  hoe: assetMap.axe,
  sword: assetMap.sword,
  coal: assetMap.stone,
  iron: assetMap.iron,
  gold: assetMap.emerald,
  diamond: assetMap.diamond,
  emerald: assetMap.emerald,
  apple: assetMap.star,
  bread: assetMap.star,
  carrot: assetMap.star,
  potato: assetMap.star,
  beef: assetMap.star,
  pig: assetMap.star,
  cow: assetMap.star,
  sheep: assetMap.star,
  wolf: assetMap.zombie,
  zombie: assetMap.zombie,
  creeper: assetMap.creeper,
  skeleton: assetMap.skeleton,
  spider: assetMap.skeleton,
  villager: assetMap.star,
  mine: assetMap.pickaxe,
  build: assetMap.axe,
  run: assetMap.star,
  jump: assetMap.star,
  fight: assetMap.sword,
  sleep: assetMap.chest,
  trade: assetMap.emerald,
  forest: backgroundMap.forest,
  cave: backgroundMap.cave,
  village: backgroundMap.village,
  "diamond-sword": assetMap.sword,
  wool: assetMap.star,
  bone: assetMap.zombie,
  leather: assetMap.star,
  arrow: assetMap.sword,
  bow: assetMap.sword,
  shield: assetMap.shield,
  helmet: assetMap.iron,
  armor: assetMap.iron,
  redstone: assetMap.emerald,
  button: assetMap.star,
  lever: assetMap.star,
  piston: assetMap.iron,
  ladder: assetMap.wood,
  fence: assetMap.wood,
  water: assetMap.star,
  obsidian: assetMap.stone,
  flint: assetMap.stone,
  book: assetMap.chest,
  bookshelf: assetMap.chest,
  lapis: assetMap.emerald,
  nether: backgroundMap.battle,
  portal: assetMap.emerald,
  end: backgroundMap.battle,
  dragon: assetMap.skeleton,
  wheat: assetMap.star,
  seed: assetMap.star,
  farm: assetMap.star,
  light: assetMap.star,
  dark: assetMap.star,
  deep: assetMap.pickaxe,
  rare: assetMap.diamond,
  friend: assetMap.star,
  tame: assetMap.zombie,
  horse: assetMap.star,
  boat: assetMap.wood,
  saddle: assetMap.star,
  map: backgroundMap.village,
  night: assetMap.star,
  monster: assetMap.zombie,
  block: assetMap.stone,
  ore: assetMap.iron,
  ingot: assetMap.iron,
  smelt: assetMap.iron,
  fuel: assetMap.stone,
  "pressure-plate": assetMap.star,
  enchant: assetMap.emerald,
  hidden: assetMap.lock,
  shelter: assetMap.chest,
  safe: assetMap.shield,
  gate: assetMap.wood,
};

export const unlockableAssetMap: Record<string, string> = {
  "wooden-axe": assetMap.axe,
  "stone-pickaxe": assetMap.pickaxe,
  "iron-sword": assetMap.sword,
  "diamond-sword": assetMap.sword,
  "wooden-sword": assetMap.sword,
  "word-miner": assetMap.pickaxe,
  "diamond-speaker": assetMap.diamond,
  "forest-map": backgroundMap.forest,
  "cave-map": backgroundMap.cave,
  "village-map": backgroundMap.village,
  "bed-builder": assetMap.chest,
  "zombie-fighter": assetMap.zombie,
};

export function getVocabularyIcon(id: string): string {
  return vocabularyIconMap[id] ?? assetMap.star;
}

export function getUnlockableImage(id: string): string | undefined {
  return unlockableAssetMap[id];
}

export function getRarityClasses(rarity: Rarity) {
  return rarityColors[rarity];
}

export function getRarityBorderClass(rarity: Rarity): string {
  return rarityColors[rarity].border;
}

export function getRarityRingClass(rarity: Rarity): string {
  return rarityColors[rarity].ring;
}

export function getRarityLabel(rarity: Rarity): string {
  return rarityColors[rarity].label;
}

export function getResourceIcon(resource: ResourceType): string {
  return resourceAssetMap[resource];
}

export function getMapAreaBackground(area: MapArea): string {
  return mapAreaBackgrounds[area];
}
