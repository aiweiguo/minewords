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

/** Forest is always open; cave needs wooden sword; mines need stone sword. */
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
 * Zone-biased drops so each portal feeds its craft goal.
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
  const xpRewards = base.filter((reward) => reward.type === "xp");
  const materialBias = buildMaterialBias(wordId, focus);

  return [...materialBias, ...xpRewards.map((reward) => ({ ...reward }))];
}

function buildMaterialBias(
  wordId: string,
  focus: ResourceType,
): Reward[] {
  if (focus === "wood") {
    return [
      { type: "resource", resource: "wood", amount: focusAmount(wordId, "wood") },
      { type: "resource", resource: "stone", amount: 1 },
    ];
  }
  if (focus === "stone") {
    return [
      { type: "resource", resource: "stone", amount: focusAmount(wordId, "stone") },
      { type: "resource", resource: "wood", amount: 1 },
    ];
  }
  if (focus === "iron") {
    return [
      { type: "resource", resource: "iron", amount: focusAmount(wordId, "iron") },
      { type: "resource", resource: "stone", amount: 1 },
    ];
  }
  return [
    { type: "resource", resource: focus, amount: focusAmount(wordId, focus) },
  ];
}

function focusAmount(wordId: string, focus: ResourceType): number {
  if (focus === "wood") {
    if (wordId === "zombie") return 3;
    if (wordId === "spider") return 2;
    return 2;
  }
  if (focus === "stone") {
    if (wordId === "skeleton") return 3;
    if (wordId === "creeper") return 4;
    return 3;
  }
  if (focus === "iron") {
    if (wordId === "blaze") return 3;
    if (wordId === "creeper") return 3;
    return 2;
  }
  return 2;
}

export function getWildMonsterIdsForZone(zoneId: ExploreZoneId): readonly string[] {
  return getExploreZoneById(zoneId)?.wildMonsterIds ?? [];
}
