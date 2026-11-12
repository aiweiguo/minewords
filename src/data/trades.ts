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

/**
 * Villager speak-trade offers (MW-20).
 * Repeatable: kids practice buy/trade sentences for rare mats.
 * Not a gold/diamond weapon ladder — materials only.
 */
export const tradeOffers: TradeOffer[] = [
  {
    id: "wood-for-emerald",
    title: "Trade Wood",
    titleCn: "用木头换绿宝石",
    npcLine: "Hmm… I like wood. Want to trade?",
    npcLineCn: "嗯……我喜欢木头。想交易吗？",
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
    titleCn: "买钻石",
    npcLine: "Looking for diamonds? Speak up!",
    npcLineCn: "想要钻石？开口说！",
    costs: [{ resource: "emerald", amount: 3 }],
    gains: [{ resource: "diamond", amount: 1 }],
    expectedSpeech: "Can I buy diamonds?",
    speechKeywords: ["buy", "diamond", "diamonds", "please", "trade"],
    speechHintCn: "说 buy / diamond，或 Can I buy diamonds?",
    speechHintEn: "Say buy, diamond, or Can I buy diamonds?",
    wordIds: ["diamond", "trade"],
    craftXp: 12,
    icon: assetMap.diamond,
  },
  {
    id: "iron-for-diamond",
    title: "Trade Iron",
    titleCn: "用铁换钻石",
    npcLine: "Iron for diamond — fair deal?",
    npcLineCn: "铁换钻石——公平吗？",
    costs: [{ resource: "iron", amount: 5 }],
    gains: [{ resource: "diamond", amount: 1 }],
    expectedSpeech: "Trade iron for diamond",
    speechKeywords: ["trade", "iron", "diamond"],
    speechHintCn: "说 trade / iron / diamond",
    speechHintEn: "Say trade, iron, or diamond",
    wordIds: ["trade", "iron", "diamond"],
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
