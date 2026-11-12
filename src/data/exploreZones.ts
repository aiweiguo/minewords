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
    blurbCn: "开口打怪，攒木头做木剑 · 单词起步",
    blurbEn: "Word attack for wood",
    focusResource: "wood",
    focusLabelCn: "木头",
    requiredWeaponId: null,
    wildMonsterIds: ["zombie", "spider"],
    background: backgroundMap.forest,
    tone: "forest",
    attackSpeech: "word",
  },
  {
    id: "cave",
    name: "Cave",
    nameCn: "洞穴",
    blurbCn: "更深的怪，掉石头做石剑 · 短句起步",
    blurbEn: "Phrase attack for stone",
    focusResource: "stone",
    focusLabelCn: "石头",
    requiredWeaponId: "wooden-sword",
    wildMonsterIds: ["skeleton", "creeper"],
    background: backgroundMap.cave,
    tone: "cave",
    // MW-19: cave starts on the short-phrase rung of the same-monster ladder.
    attackSpeech: "phrase",
  },
  {
    id: "mines",
    name: "Deep Mines",
    nameCn: "深层矿洞",
    blurbCn: "更难的怪，掉铁做铁剑 · 整句打满，单词也能削血",
    blurbEn: "Sentence for max iron — word still chips",
    focusResource: "iron",
    focusLabelCn: "铁",
    requiredWeaponId: "stone-sword",
    wildMonsterIds: ["blaze", "creeper"],
    background: backgroundMap.battle,
    tone: "mines",
    // MW-19/35: starts at sentence; word/phrase still chip; misses step down to word.
    attackSpeech: "sentence",
  },
  {
    id: "crystal",
    name: "Crystal Depths",
    nameCn: "钻石矿脉",
    blurbCn: "铁剑解锁 · 掉钻石做钻石剑 · 整句打满，单词也能削血",
    blurbEn: "Sentence for max diamond — word still chips",
    focusResource: "diamond",
    focusLabelCn: "钻石",
    requiredWeaponId: "iron-sword",
    wildMonsterIds: ["blaze", "skeleton"],
    background: backgroundMap.cave,
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
