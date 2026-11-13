import { backgroundMap } from "@/lib/assets";
import { ResourceType } from "@/types";
import { WeaponTierId } from "@/data/weapons";

export type ExploreZoneId = "forest" | "cave" | "mines" | "crystal";

export type ExploreZone = {
  id: ExploreZoneId;
  name: string;
  nameCn: string;
  /** Short one-job line under the portal. */
  blurbCn: string;
  blurbEn: string;
  /** Primary material this zone feeds into craft goals. */
  focusResource: ResourceType;
  focusLabelCn: string;
  /** null = open from the start (wood-tier gather). */
  requiredWeaponId: WeaponTierId | null;
  /** Wild speak-attack encounters in this zone. */
  wildMonsterIds: readonly string[];
  background: string;
  tone: "forest" | "cave" | "mines" | "crystal";
  /**
   * Speak-attack load for this zone.
   * word → short phrase → full sentence (weapon ladder).
   */
  attackSpeech: "word" | "phrase" | "sentence";
};

/**
 * Weapon-tier explore zones (MW-7 → MW-32).
 * Forest → wood; cave → stone; mines → iron; crystal depths (iron sword) → diamond.
 */
export const exploreZones: ExploreZone[] = [
  {
    id: "forest",
    name: "Forest",
    nameCn: "森林",
    blurbCn: "僵尸·蜘蛛·狼 · 攒木头做木剑 · 单词起步",
    blurbEn: "Word attack for wood · wolf exclusive",
    focusResource: "wood",
    focusLabelCn: "木头",
    requiredWeaponId: null,
    // MW-44: +wolf (forest exclusive; already in vocab).
    wildMonsterIds: ["zombie", "spider", "wolf"],
    background: backgroundMap.forest,
    tone: "forest",
    attackSpeech: "word",
  },
  {
    id: "cave",
    name: "Cave",
    nameCn: "洞穴",
    blurbCn: "骷髅·苦力怕·女巫 · 掉石头做石剑 · 短句起步",
    blurbEn: "Phrase attack for stone · witch exclusive",
    focusResource: "stone",
    focusLabelCn: "石头",
    requiredWeaponId: "wooden-sword",
    // MW-44: +witch (cave exclusive).
    wildMonsterIds: ["skeleton", "creeper", "witch"],
    background: backgroundMap.cave,
    tone: "cave",
    // MW-19: cave starts on the short-phrase rung of the same-monster ladder.
    attackSpeech: "phrase",
  },
  {
    id: "mines",
    name: "Deep Mines",
    nameCn: "深层矿洞",
    blurbCn: "烈焰人·苦力怕·末影人 · 掉铁做铁剑 · 整句打满",
    blurbEn: "Sentence for iron · enderman exclusive",
    focusResource: "iron",
    focusLabelCn: "铁",
    requiredWeaponId: "stone-sword",
    // MW-44: +enderman (mines exclusive).
    wildMonsterIds: ["blaze", "creeper", "enderman"],
    background: backgroundMap.mines,
    tone: "mines",
    // MW-19/35: starts at sentence; word/phrase still chip; misses step down to word.
    attackSpeech: "sentence",
  },
  {
    id: "crystal",
    name: "Crystal Depths",
    nameCn: "钻石矿脉",
    blurbCn: "水晶怪·骷髅 · 掉钻石做钻石剑 · 整句打满",
    blurbEn: "Crystal unique · sentence for diamond",
    focusResource: "diamond",
    focusLabelCn: "钻石",
    requiredWeaponId: "iron-sword",
    // MW-44: crystal = diamond-semantic unique (not a mines/blaze reskin); keep skeleton.
    wildMonsterIds: ["crystal", "skeleton"],
    background: backgroundMap.crystal,
    tone: "crystal",
    // Same ladder as mines: sentence start, lower rungs chip, miss step-down (MW-35).
    attackSpeech: "sentence",
  },
];

export const DEFAULT_EXPLORE_ZONE_ID: ExploreZoneId = "forest";

export function getExploreZoneById(
  id: string | null | undefined,
): ExploreZone | undefined {
  if (!id) return undefined;
  return exploreZones.find((zone) => zone.id === id);
}

export function isExploreZoneId(id: string): id is ExploreZoneId {
  return exploreZones.some((zone) => zone.id === id);
}
