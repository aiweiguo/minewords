import { WeaponCost } from "@/data/weapons";
import { assetMap } from "@/lib/assets";
import { ResourceType } from "@/types";

export type TradeCost = {
  resource: ResourceType;
  amount: number;
};

export type TradeOffer = {
  id: string;
  /** Kid-facing English title. */
  title: string;
  titleCn: string;
  /** Villager NPC line before the kid speaks. */
  npcLine: string;
  npcLineCn: string;
  /** What the kid spends. */
  costs: TradeCost[];
  /** What the kid receives. */
  gains: TradeCost[];
  /** Phrase kids can say; also used for TTS demo. */
  expectedSpeech: string;
  /** Lenient keywords — one hit is enough (same as speak-craft). */
  speechKeywords: string[];
  speechHintCn: string;
  speechHintEn: string;
  /** Word ids marked learned on a successful trade. */
  wordIds: string[];
  craftXp: number;
  icon: string;
};

/** Settle / goal-bar nudge when trade can feed the current weapon goal (MW-34). */
export type TradeGoalNudge = {
  offerId: string;
  href: string;
  labelCn: string;
  labelEn: string;
  stripCn: string;
  stripEn: string;
};

/**
 * Villager speak-trade offers (MW-20 → MW-34).
 * Repeatable: kids practice buy/trade sentences for rare mats.
 * Post-iron: diamond offers tie to the diamond-sword goal.
 */
export const tradeOffers: TradeOffer[] = [
  {
    id: "wood-for-emerald",
    title: "Trade Wood",
    titleCn: "用木头换绿宝石",
    npcLine: "Need emeralds for diamonds? Trade me wood first!",
    npcLineCn: "做钻石剑要绿宝石？先用木头跟我换！",
    costs: [{ resource: "wood", amount: 4 }],
    gains: [{ resource: "emerald", amount: 1 }],
    expectedSpeech: "I trade wood for emerald",
    speechKeywords: ["trade", "wood", "emerald"],
    speechHintCn: "说 trade / wood / emerald，或整句 I trade wood for emerald",
    speechHintEn: "Say trade, wood, emerald, or the full sentence",
    wordIds: ["trade", "wood", "emerald"],
    craftXp: 6,
    icon: assetMap.wood,
  },
  {
    id: "buy-gold",
    title: "Buy Gold",
    titleCn: "买金锭",
    npcLine: "Gold? I can sell you some.",
    npcLineCn: "金子？我可以卖给你。",
    costs: [{ resource: "emerald", amount: 2 }],
    gains: [{ resource: "gold", amount: 1 }],
    expectedSpeech: "I want to buy gold",
    speechKeywords: ["buy", "gold", "want", "trade"],
    speechHintCn: "说 buy / gold，或 I want to buy gold",
    speechHintEn: "Say buy, gold, or I want to buy gold",
    wordIds: ["gold", "trade"],
    craftXp: 8,
    icon: assetMap.emerald,
  },
  {
    id: "buy-diamonds",
    title: "Buy Diamonds",
    titleCn: "买钻石做剑",
    npcLine: "Diamond sword needs diamonds — can I sell you some?",
    npcLineCn: "钻石剑缺钻石？开口跟我买！",
    costs: [{ resource: "emerald", amount: 3 }],
    gains: [{ resource: "diamond", amount: 1 }],
    expectedSpeech: "Can I buy diamonds?",
    speechKeywords: ["buy", "diamond", "diamonds", "please", "trade", "sword"],
    speechHintCn: "说 buy / diamond / sword，或 Can I buy diamonds?",
    speechHintEn: "Say buy, diamond, sword, or Can I buy diamonds?",
    wordIds: ["diamond", "trade", "sword"],
    craftXp: 12,
    icon: assetMap.diamond,
  },
  {
    id: "iron-for-diamond",
    title: "Trade Iron",
    titleCn: "用铁换钻石做剑",
    npcLine: "Extra iron? Trade for a diamond — for your sword!",
    npcLineCn: "铁多了？换钻石去做钻石剑！",
    costs: [{ resource: "iron", amount: 5 }],
    gains: [{ resource: "diamond", amount: 1 }],
    expectedSpeech: "Trade iron for diamond",
    speechKeywords: ["trade", "iron", "diamond", "sword"],
    speechHintCn: "说 trade / iron / diamond / sword",
    speechHintEn: "Say trade, iron, diamond, or sword",
    wordIds: ["trade", "iron", "diamond", "sword"],
    craftXp: 10,
    icon: assetMap.iron,
  },
];

export function getTradeOfferById(id: string): TradeOffer | undefined {
  return tradeOffers.find((offer) => offer.id === id);
}

export function canAffordTrade(
  offer: TradeOffer,
  resources: Partial<Record<ResourceType, number>>,
): boolean {
  return offer.costs.every(
    (cost) => (resources[cost.resource] ?? 0) >= cost.amount,
  );
}

function formatMissingCn(missing: WeaponCost[]): string {
  return missing.map((m) => `${m.amount} ${m.resource}`).join(" · ");
}

/**
 * When the current weapon goal is short on tradeable mats (esp. diamond),
 * pick a speak-trade offer and CTA copy for settle / goal bar.
 */
export function getTradeNudgeForGoal(
  missing: WeaponCost[],
  resources: Partial<Record<ResourceType, number>>,
): TradeGoalNudge | null {
  const missingDiamond = missing.find((m) => m.resource === "diamond");
  if (!missingDiamond) return null;

  const missingLabel = formatMissingCn(missing);
  const buyDiamonds = getTradeOfferById("buy-diamonds");
  const ironForDiamond = getTradeOfferById("iron-for-diamond");
  const woodForEmerald = getTradeOfferById("wood-for-emerald");

  if (buyDiamonds && canAffordTrade(buyDiamonds, resources)) {
    return {
      offerId: buyDiamonds.id,
      href: `/trade?offer=${buyDiamonds.id}`,
      labelCn: "去交易",
      labelEn: "Go trade",
      stripCn: `还差 ${missingLabel} · 开口买钻石做剑`,
      stripEn: `Need ${missingLabel} — speak: Can I buy diamonds?`,
    };
  }

  if (ironForDiamond && canAffordTrade(ironForDiamond, resources)) {
    return {
      offerId: ironForDiamond.id,
      href: `/trade?offer=${ironForDiamond.id}`,
      labelCn: "去交易",
      labelEn: "Go trade",
      stripCn: `还差 ${missingLabel} · 用铁换钻石做剑`,
      stripEn: `Need ${missingLabel} — trade iron for diamond`,
    };
  }

  if (woodForEmerald && canAffordTrade(woodForEmerald, resources)) {
    return {
      offerId: woodForEmerald.id,
      href: `/trade?offer=${woodForEmerald.id}`,
      labelCn: "去交易",
      labelEn: "Go trade",
      stripCn: `还差 ${missingLabel} · 先用木头换绿宝石`,
      stripEn: `Need ${missingLabel} — trade wood for emerald first`,
    };
  }

  // Partial emerald bank: still send kids to the diamond offer.
  if ((resources.emerald ?? 0) > 0) {
    return {
      offerId: "buy-diamonds",
      href: "/trade?offer=buy-diamonds",
      labelCn: "去交易",
      labelEn: "Go trade",
      stripCn: `还差 ${missingLabel} · 绿宝石可去交易买钻石`,
      stripEn: `Need ${missingLabel} — spend emeralds at trade`,
    };
  }

  return null;
}

/** Prefer diamond-sword trades when picking a default offer on /trade. */
export function pickPreferredTradeOfferId(
  resources: Partial<Record<ResourceType, number>>,
  missingGoalCosts: WeaponCost[] = [],
): string {
  const nudge = getTradeNudgeForGoal(missingGoalCosts, resources);
  if (nudge) return nudge.offerId;

  const affordable = tradeOffers.find((offer) =>
    canAffordTrade(offer, resources),
  );
  return affordable?.id ?? tradeOffers[0]?.id ?? "buy-diamonds";
}
