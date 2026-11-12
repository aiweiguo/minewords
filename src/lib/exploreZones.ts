import {
  DEFAULT_EXPLORE_ZONE_ID,
  ExploreZone,
  ExploreZoneId,
  exploreZones,
  getExploreZoneById,
} from "@/data/exploreZones";
import { getMonsterDropRewards } from "@/data/monsterDrops";
import { getWeaponTierById, WeaponTierId } from "@/data/weapons";
import { Reward, ResourceType } from "@/types";

export type ExploreZoneLockInfo = {
  unlocked: boolean;
  requiredWeaponId: WeaponTierId | null;
  requiredWeaponNameCn: string | null;
  requiredWeaponNameEn: string | null;
  lockCn: string | null;
  lockEn: string | null;
};

/** Forest is always open; cave needs wooden sword on the rack. */
export function isExploreZoneUnlocked(
  zone: ExploreZone,
  unlockedIds: string[],
): boolean {
  if (!zone.requiredWeaponId) return true;
  return unlockedIds.includes(zone.requiredWeaponId);
}

export function getExploreZoneLockInfo(
  zone: ExploreZone,
  unlockedIds: string[],
): ExploreZoneLockInfo {
  if (!zone.requiredWeaponId) {
    return {
      unlocked: true,
      requiredWeaponId: null,
      requiredWeaponNameCn: null,
      requiredWeaponNameEn: null,
      lockCn: null,
      lockEn: null,
    };
  }

  const weapon = getWeaponTierById(zone.requiredWeaponId);
  const unlocked = unlockedIds.includes(zone.requiredWeaponId);
  const nameCn = weapon?.nameCn ?? zone.requiredWeaponId;
  const nameEn = weapon?.name ?? zone.requiredWeaponId;

  return {
    unlocked,
    requiredWeaponId: zone.requiredWeaponId,
    requiredWeaponNameCn: nameCn,
    requiredWeaponNameEn: nameEn,
    lockCn: unlocked ? null : `需要${nameCn}`,
    lockEn: unlocked ? null : `Need ${nameEn}`,
  };
}

export function listExploreZoneStates(unlockedIds: string[]) {
  return exploreZones.map((zone) => ({
    zone,
    ...getExploreZoneLockInfo(zone, unlockedIds),
  }));
}

/** Resolve persisted selection; fall back if missing or locked. */
export function resolveSelectedExploreZoneId(
  selectedId: string | null | undefined,
  unlockedIds: string[],
): ExploreZoneId {
  const preferred = getExploreZoneById(selectedId);
  if (preferred && isExploreZoneUnlocked(preferred, unlockedIds)) {
    return preferred.id;
  }

  const firstOpen = exploreZones.find((zone) =>
    isExploreZoneUnlocked(zone, unlockedIds),
  );
  return firstOpen?.id ?? DEFAULT_EXPLORE_ZONE_ID;
}

/**
 * Zone-biased drops so forest feeds wood craft goals and cave feeds stone.
 * Keeps XP; reweights resource drops toward the zone focus.
 */
export function getMonsterDropRewardsForZone(
  wordId: string,
  zoneId: ExploreZoneId,
): Reward[] {
  const zone = getExploreZoneById(zoneId);
  if (!zone) return getMonsterDropRewards(wordId);

  const base = getMonsterDropRewards(wordId);
  const focus = zone.focusResource;
  const secondary: ResourceType = focus === "wood" ? "stone" : "wood";

  const xpRewards = base.filter((reward) => reward.type === "xp");
  const materialBias: Reward[] =
    zoneId === "forest"
      ? [
          { type: "resource", resource: "wood", amount: focusAmount(wordId, "wood") },
          { type: "resource", resource: "stone", amount: 1 },
        ]
      : [
          { type: "resource", resource: "stone", amount: focusAmount(wordId, "stone") },
          { type: "resource", resource: secondary, amount: 1 },
        ];

  return [...materialBias, ...xpRewards.map((reward) => ({ ...reward }))];
}

function focusAmount(wordId: string, focus: ResourceType): number {
  // Slightly stronger packs on tougher wilds so cave feels worth the wooden sword.
  if (focus === "wood") {
    if (wordId === "zombie") return 3;
    if (wordId === "spider") return 2;
    return 2;
  }
  if (wordId === "skeleton") return 3;
  if (wordId === "creeper") return 4;
  return 3;
}

export function getWildMonsterIdsForZone(zoneId: ExploreZoneId): readonly string[] {
  return getExploreZoneById(zoneId)?.wildMonsterIds ?? [];
}
