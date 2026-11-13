import { getTradeNudgeForGoal } from "@/data/trades";
import {
  getWeaponTierById,
  getWeaponTierIndex,
  weaponTiers,
  WeaponCost,
  WeaponTier,
  WeaponTierId,
} from "@/data/weapons";
import { ResourceType, RoomBlocks, RoomSlotId } from "@/types";

export type WeaponGoalStatus =
  | "gather"
  | "ready"
  | "owned-current"
  | "line-complete";

export type HomeFillProgress = {
  filled: number;
  total: number;
  empty: number;
};

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
  /** Post-diamond home decorate progress (hub room slots). */
  homeFill: HomeFillProgress | null;
};

/** Hub side-view room slots kids can fill with plank/cobble/glass/wool (MW-41 → MW-52). */
export const HOME_ROOM_SLOTS: RoomSlotId[] = [
  "floor-0",
  "floor-1",
  "floor-2",
  "floor-3",
  "floor-4",
  "floor-5",
  "wall-0",
  "wall-1",
  "wall-2",
  "wall-3",
];

export function getHomeFillProgress(
  roomBlocks: RoomBlocks = {},
): HomeFillProgress {
  const total = HOME_ROOM_SLOTS.length;
  const filled = HOME_ROOM_SLOTS.filter((slot) => Boolean(roomBlocks[slot])).length;
  return {
    filled,
    total,
    empty: Math.max(0, total - filled),
  };
}

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

function lineCompleteHomeSnapshot(
  equipped: WeaponTier | null,
  top: WeaponTier | undefined,
  homeFill: HomeFillProgress,
): WeaponGoalSnapshot {
  const badge = equipped
    ? `${equipped.nameCn}已挂上 · 武装线完成`
    : "武器线已完成";
  const badgeEn = equipped
    ? `${equipped.name} on the rack · line complete`
    : "Weapon line complete";

  if (homeFill.empty > 0) {
    return {
      goal: top ?? null,
      equipped,
      status: "line-complete",
      missing: [],
      primaryMissing: null,
      canCraft: false,
      canTrade: false,
      homeFill,
      stripCn: `${badge} · 还差 ${homeFill.empty} 个家装位`,
      stripEn: `${badgeEn} · ${homeFill.empty} home slots left`,
      primaryCta: {
        href: "/#decorate",
        labelCn: "装扮我家",
        labelEn: "Decorate home",
        kind: "home",
      },
      nextPreviewCn: `家装 ${homeFill.filled}/${homeFill.total} · 用木板/圆石/玻璃/羊毛铺满基地`,
      nextPreviewEn: `Home ${homeFill.filled}/${homeFill.total} · fill with plank/cobble/glass/wool`,
    };
  }

  return {
    goal: top ?? null,
    equipped,
    status: "line-complete",
    missing: [],
    primaryMissing: null,
    canCraft: false,
    canTrade: false,
    homeFill,
    stripCn: `${badge} · 家已装满`,
    stripEn: `${badgeEn} · home filled`,
    primaryCta: {
      href: "/#decorate",
      labelCn: "回我家看看",
      labelEn: "Visit home",
      kind: "home",
    },
    nextPreviewCn: "家装满了 · 想探险就出门打怪",
    nextPreviewEn: "Home complete · explore when you want",
  };
}

export function getWeaponGoalSnapshot(
  unlockedIds: string[],
  resources: Record<ResourceType, number>,
  roomBlocks: RoomBlocks = {},
): WeaponGoalSnapshot {
  const equipped = getEquippedWeapon(unlockedIds);
  const goal = getCurrentWeaponGoal(unlockedIds);
  const homeFill = getHomeFillProgress(roomBlocks);

  if (!goal) {
    const top = weaponTiers[weaponTiers.length - 1];
    return lineCompleteHomeSnapshot(equipped, top, homeFill);
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
      homeFill: null,
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
      homeFill: null,
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
    homeFill: null,
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
