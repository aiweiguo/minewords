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
  /**
   * Speech keywords for speak-trade.
   * Early funnel (wood→emerald): 1 hit. Diamond-path offers (P2-5): ≥2 or full phrase.
   */
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
  // buy-gold removed (MW-47 / P2-1): gold had no craft sink — selling it
  // burned emeralds into a dead resource. Keep "gold" as vocab only.
  {
    id: "buy-diamonds",
    title: "Buy Diamonds",
    titleCn: "买钻石做剑",
    npcLine: "Diamond sword needs diamonds — can I sell you some?",
    npcLineCn: "钻石剑缺钻石？开口跟我买！",
    costs: [{ resource: "emerald", amount: 3 }],
    gains: [{ resource: "diamond", amount: 1 }],
    expectedSpeech: "Can I buy diamonds?",
    // "diamonds" omitted — "diamond" already matches via includes (avoid double-count).
    speechKeywords: ["buy", "diamond", "please", "trade", "sword"],
    speechHintCn: "至少两个词，如 buy diamond；或整句 Can I buy diamonds?",
    speechHintEn:
      "Say at least two keywords (e.g. buy diamond) or Can I buy diamonds?",
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
    speechHintCn: "至少两个词，如 trade iron / iron diamond；或整句",
    speechHintEn:
      "Say at least two keywords (e.g. trade iron) or the full phrase",
    wordIds: ["trade", "iron", "diamond", "sword"],
    craftXp: 10,
    icon: assetMap.iron,
  },
  // MW-57: decoration words that never hit fight prompts (ocean dock / cozy bed).
  {
    id: "boat-for-ocean",
    title: "Trade for a Boat",
    titleCn: "换小船去海边",
    npcLine: "Want to sail the ocean? Trade wood for a boat tip — say boat!",
    npcLineCn: "想去海边？用木头换主意，开口说 boat / ocean！",
    costs: [{ resource: "wood", amount: 3 }],
    gains: [{ resource: "emerald", amount: 1 }],
    expectedSpeech: "I want a boat for the ocean",
    speechKeywords: ["boat", "ocean", "swim"],
    speechHintCn: "至少两个词，如 boat ocean；或整句 I want a boat for the ocean",
    speechHintEn:
      "Say at least two of boat/ocean/swim, or the full sentence",
    wordIds: ["boat", "ocean", "swim"],
    craftXp: 8,
    icon: assetMap.wood,
  },
  {
    id: "bed-to-sleep",
    title: "Ask for a Bed",
    titleCn: "开口要一张床",
    npcLine: "Home needs a cozy bed — say bed and sleep!",
    npcLineCn: "家里要温暖小床？开口说 bed / sleep！",
    costs: [{ resource: "wood", amount: 2 }],
    gains: [{ resource: "emerald", amount: 1 }],
    expectedSpeech: "I need a bed to sleep",
    speechKeywords: ["bed", "sleep", "need"],
    speechHintCn: "至少两个词，如 bed sleep；或整句 I need a bed to sleep",
    speechHintEn: "Say at least two keywords (e.g. bed sleep) or the full sentence",
    wordIds: ["bed", "sleep"],
    craftXp: 7,
    icon: assetMap.wood,
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
