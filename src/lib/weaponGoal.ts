import { getTradeNudgeForGoal } from "@/data/trades";
import {
  getWeaponTierById,
  getWeaponTierIndex,
  weaponTiers,
  WeaponCost,
  WeaponTier,
  WeaponTierId,
} from "@/data/weapons";
import { ResourceType } from "@/types";

export type WeaponGoalStatus =
  | "gather"
  | "ready"
  | "owned-current"
  | "line-complete";

export type WeaponGoalSnapshot = {
  /** Current target weapon, or highest owned when line is complete. */
  goal: WeaponTier | null;
  /** Best owned weapon on the ladder (or null if empty rack). */
  equipped: WeaponTier | null;
  status: WeaponGoalStatus;
  missing: WeaponCost[];
  /** Primary missing resource for compact copy (prefer wood then first missing). */
  primaryMissing: WeaponCost | null;
  canCraft: boolean;
  /** True when settle / goal bar should push speak-trade for missing mats. */
  canTrade: boolean;
  stripCn: string;
  stripEn: string;
  primaryCta: {
    href: string;
    labelCn: string;
    labelEn: string;
    kind: "craft" | "trade" | "fight" | "home";
  };
  nextPreviewCn: string;
  nextPreviewEn: string;
};

function missingCosts(
  costs: WeaponCost[],
  resources: Record<ResourceType, number>,
): WeaponCost[] {
  return costs
    .map((cost) => ({
      resource: cost.resource,
      amount: Math.max(0, cost.amount - (resources[cost.resource] ?? 0)),
    }))
    .filter((cost) => cost.amount > 0);
}

function canAfford(
  costs: WeaponCost[],
  resources: Record<ResourceType, number>,
): boolean {
  return costs.every((cost) => (resources[cost.resource] ?? 0) >= cost.amount);
}

export function hasWeapon(
  unlockedIds: string[],
  weaponId: WeaponTierId,
): boolean {
  return unlockedIds.includes(weaponId);
}

export function getEquippedWeapon(unlockedIds: string[]): WeaponTier | null {
  let best: WeaponTier | null = null;
  for (const tier of weaponTiers) {
    if (hasWeapon(unlockedIds, tier.id)) {
      best = tier;
    }
  }
  return best;
}

export function getCurrentWeaponGoal(unlockedIds: string[]): WeaponTier | null {
  for (const tier of weaponTiers) {
    if (!hasWeapon(unlockedIds, tier.id)) {
      return tier;
    }
  }
  return null;
}

function formatMissingCn(missing: WeaponCost[]): string {
  return missing
    .map((m) => `${m.amount} ${m.resource}`)
    .join(" · ");
}

export function getWeaponGoalSnapshot(
  unlockedIds: string[],
  resources: Record<ResourceType, number>,
): WeaponGoalSnapshot {
  const equipped = getEquippedWeapon(unlockedIds);
  const goal = getCurrentWeaponGoal(unlockedIds);

  if (!goal) {
    const top = weaponTiers[weaponTiers.length - 1];
    return {
      goal: top ?? null,
      equipped,
      status: "line-complete",
      missing: [],
      primaryMissing: null,
      canCraft: false,
      canTrade: false,
      stripCn: equipped
        ? `${equipped.nameCn}已挂上武器架 · 继续打怪探险`
        : "武器线已完成",
      stripEn: equipped
        ? `${equipped.name} on the rack · keep exploring`
        : "Weapon line complete",
      primaryCta: {
        href: "/explore",
        labelCn: "继续打怪",
        labelEn: "Keep fighting",
        kind: "fight",
      },
      nextPreviewCn: top?.nextPreviewCn ?? "武器线完成 · 继续打怪探险",
      nextPreviewEn: top?.nextPreviewEn ?? "Weapon line complete · keep exploring",
    };
  }

  const missing = missingCosts(goal.costs, resources);
  const ready = canAfford(goal.costs, resources);
  const primaryMissing = missing[0] ?? null;
  const craftHref = `/crafting/${goal.id}`;

  if (ready) {
    return {
      goal,
      equipped,
      status: "ready",
      missing: [],
      primaryMissing: null,
      canCraft: true,
      canTrade: false,
      stripCn: `材料够了！去合成${goal.goalLabelCn}`,
      stripEn: `Ready — craft the ${goal.name}`,
      primaryCta: {
        href: craftHref,
        labelCn: "去合成",
        labelEn: "Go craft",
        kind: "craft",
      },
      nextPreviewCn: goal.nextPreviewCn,
      nextPreviewEn: goal.nextPreviewEn,
    };
  }

  // Post-iron: when short on diamond (or tradeable path), nudge speak-trade.
  const tradeNudge = getTradeNudgeForGoal(missing, resources);
  if (tradeNudge) {
    return {
      goal,
      equipped,
      status: "gather",
      missing,
      primaryMissing,
      canCraft: false,
      canTrade: true,
      stripCn: tradeNudge.stripCn,
      stripEn: tradeNudge.stripEn,
      primaryCta: {
        href: tradeNudge.href,
        labelCn: tradeNudge.labelCn,
        labelEn: tradeNudge.labelEn,
        kind: "trade",
      },
      nextPreviewCn: "也可去钻石矿脉打怪掉钻石",
      nextPreviewEn: "Or farm Crystal Depths for diamond drops",
    };
  }

  const missingDiamond = missing.some((m) => m.resource === "diamond");
  return {
    goal,
    equipped,
    status: "gather",
    missing,
    primaryMissing,
    canCraft: false,
    canTrade: false,
    stripCn: missingDiamond
      ? `做一把${goal.goalLabelCn}：还差 ${formatMissingCn(missing)} · 打矿脉或攒绿宝石去交易`
      : `做一把${goal.goalLabelCn}：还差 ${formatMissingCn(missing)}`,
    stripEn: missingDiamond
      ? `Craft ${goal.name}: need ${formatMissingCn(missing)} — mine or trade`
      : `Craft ${goal.name}: need ${formatMissingCn(missing)}`,
    primaryCta: {
      href: "/explore",
      labelCn: "继续打怪",
      labelEn: "Keep fighting",
      kind: "fight",
    },
    nextPreviewCn: missingDiamond
      ? "绿宝石够了可去交易买钻石 · Can I buy diamonds?"
      : goal.nextPreviewCn,
    nextPreviewEn: missingDiamond
      ? "Bank emeralds, then trade: Can I buy diamonds?"
      : goal.nextPreviewEn,
  };
}

/** Progress fraction for the current goal's primary resource (UI bars). */
export function getGoalResourceProgress(
  goal: WeaponTier,
  resources: Record<ResourceType, number>,
): { have: number; need: number; resource: ResourceType } {
  const primary = goal.costs[0];
  return {
    resource: primary.resource,
    need: primary.amount,
    have: Math.min(resources[primary.resource] ?? 0, primary.amount),
  };
}

export function getNextWeaponAfter(id: WeaponTierId): WeaponTier | null {
  const index = getWeaponTierIndex(id);
  if (index < 0) return null;
  return weaponTiers[index + 1] ?? null;
}

export function isSpeakCraftWeaponId(id: string): id is WeaponTierId {
  return Boolean(getWeaponTierById(id));
}
