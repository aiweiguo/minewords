import { backgroundMap } from "@/lib/assets";
import { ResourceType } from "@/types";
import { WeaponTierId } from "@/data/weapons";

export type ExploreZoneId = "forest" | "cave";

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
  tone: "forest" | "cave";
};

/**
 * Weapon-tier explore zones (MW-7).
 * Forest feeds wood → wooden sword; cave unlocks after wooden sword for stone.
 */
export const exploreZones: ExploreZone[] = [
  {
    id: "forest",
    name: "Forest",
    nameCn: "森林",
    blurbCn: "开口打怪，攒木头做木剑",
    blurbEn: "Speak-attack for wood",
    focusResource: "wood",
    focusLabelCn: "木头",
    requiredWeaponId: null,
    wildMonsterIds: ["zombie", "spider"],
    background: backgroundMap.forest,
    tone: "forest",
  },
  {
    id: "cave",
    name: "Cave",
    nameCn: "洞穴",
    blurbCn: "更深的怪，掉石头做石剑",
    blurbEn: "Speak-attack for stone",
    focusResource: "stone",
    focusLabelCn: "石头",
    requiredWeaponId: "wooden-sword",
    wildMonsterIds: ["skeleton", "creeper"],
    background: backgroundMap.cave,
    tone: "cave",
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
