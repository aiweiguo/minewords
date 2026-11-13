import { assetMap } from "@/lib/assets";
import { ResourceType } from "@/types";

export type WeaponTierId =
  | "wooden-sword"
  | "stone-sword"
  | "iron-sword"
  | "diamond-sword";

export type WeaponCost = {
  resource: ResourceType;
  amount: number;
};

export type WeaponTier = {
  id: WeaponTierId;
  name: string;
  nameCn: string;
  /** Short goal label, e.g. 木剑 */
  goalLabelCn: string;
  icon: string;
  /** Inventory costs spent on successful speak-craft. */
  costs: WeaponCost[];
  /** Phrase kids can say; also used for TTS demo. */
  expectedSpeech: string;
  /**
   * Speech keywords for speak-craft.
   * Wood/stone: 1 hit passes. Iron/diamond (P2-5): ≥2 hits or full phrase.
   */
  speechKeywords: string[];
  speechHintCn: string;
  speechHintEn: string;
  craftXp: number;
  /** Compact next-tier tease shown while this weapon is the goal. */
  nextPreviewCn: string;
  nextPreviewEn: string;
  /** Visual tint class for the hub rack blade. */
  rackTone: "wood" | "stone" | "iron" | "diamond";
};

/**
 * Armed progression line for the hub (MW-6 → MW-32).
 * Stick is speech vocabulary only — inventory spends wood/stone/iron/diamond resources.
 */
export const weaponTiers: WeaponTier[] = [
  {
    id: "wooden-sword",
    name: "Wooden Sword",
    nameCn: "木剑",
    goalLabelCn: "木剑",
    icon: assetMap.sword,
    costs: [{ resource: "wood", amount: 3 }],
    expectedSpeech: "wooden sword",
    speechKeywords: ["wood", "wooden", "stick", "sword", "craft"],
    speechHintCn: "说 wood / stick / craft / wooden sword",
    speechHintEn: "Say wood, stick, craft, or wooden sword",
    craftXp: 12,
    nextPreviewCn: "下一阶：石剑 · 需要 stone",
    nextPreviewEn: "Next: stone sword · needs stone",
    rackTone: "wood",
  },
  {
    id: "stone-sword",
    name: "Stone Sword",
    nameCn: "石剑",
    goalLabelCn: "石剑",
    icon: assetMap.sword,
    costs: [
      { resource: "stone", amount: 3 },
      { resource: "wood", amount: 1 },
    ],
    expectedSpeech: "craft stone sword",
    speechKeywords: ["stone", "sword", "craft"],
    speechHintCn: "说 stone sword 或 Craft stone sword",
    speechHintEn: "Say stone sword or Craft stone sword",
    craftXp: 18,
    nextPreviewCn: "下一阶：铁剑 · 需要 iron",
    nextPreviewEn: "Next: iron sword · needs iron",
    rackTone: "stone",
  },
  {
    id: "iron-sword",
    name: "Iron Sword",
    nameCn: "铁剑",
    goalLabelCn: "铁剑",
    icon: assetMap.sword,
    costs: [
      { resource: "iron", amount: 3 },
      { resource: "wood", amount: 1 },
    ],
    expectedSpeech: "I craft an iron sword",
    speechKeywords: ["craft", "iron", "sword"],
    speechHintCn: "至少两个词，如 iron sword；或整句 I craft an iron sword",
    speechHintEn: "Say at least two keywords (e.g. iron sword) or the full sentence",
    craftXp: 24,
    nextPreviewCn: "下一阶：钻石剑 · 矿脉掉落或去交易买钻石",
    nextPreviewEn: "Next: diamond sword · mine or trade for diamonds",
    rackTone: "iron",
  },
  {
    id: "diamond-sword",
    name: "Diamond Sword",
    nameCn: "钻石剑",
    goalLabelCn: "钻石剑",
    icon: assetMap.sword,
    costs: [
      { resource: "diamond", amount: 2 },
      { resource: "wood", amount: 1 },
    ],
    // Trade-style longer sentence (P1 / MW-32) — mirrors speak-trade fluency.
    expectedSpeech: "Can I craft a diamond sword?",
    speechKeywords: ["craft", "diamond", "sword", "buy", "want", "please"],
    speechHintCn: "至少两个词，如 diamond sword；或整句 Can I craft a diamond sword?",
    speechHintEn:
      "Say at least two keywords (e.g. diamond sword) or the full sentence",
    craftXp: 32,
    nextPreviewCn: "挂上后下一目标：装扮我家 · 铺满基地",
    nextPreviewEn: "After this: decorate home · fill the base",
    rackTone: "diamond",
  },
];

export function getWeaponTierById(id: string): WeaponTier | undefined {
  return weaponTiers.find((tier) => tier.id === id);
}

export function getWeaponTierIndex(id: WeaponTierId): number {
  return weaponTiers.findIndex((tier) => tier.id === id);
}
