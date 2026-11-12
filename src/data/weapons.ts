import { assetMap } from "@/lib/assets";
import { ResourceType } from "@/types";

export type WeaponTierId = "wooden-sword" | "stone-sword";

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
  /** Lenient keywords — scoreSpeechAttempt needs ≥2 or full phrase. */
  speechKeywords: string[];
  speechHintCn: string;
  speechHintEn: string;
  craftXp: number;
  /** Compact next-tier tease shown while this weapon is the goal. */
  nextPreviewCn: string;
  nextPreviewEn: string;
  /** Visual tint class for the hub rack blade. */
  rackTone: "wood" | "stone";
};

/**
 * Armed progression line for the hub (MW-6).
 * Stick is speech vocabulary only — inventory spends wood/stone resources.
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
    nextPreviewCn: "下一阶：铁剑 · 稍后开放",
    nextPreviewEn: "Next: iron sword · coming later",
    rackTone: "stone",
  },
];

export function getWeaponTierById(id: string): WeaponTier | undefined {
  return weaponTiers.find((tier) => tier.id === id);
}

export function getWeaponTierIndex(id: WeaponTierId): number {
  return weaponTiers.findIndex((tier) => tier.id === id);
}
