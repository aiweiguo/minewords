import { ExploreZoneId, getExploreZoneById } from "@/data/exploreZones";
import { getVocabularyById } from "@/data/vocabulary";

export type FluencyRung = "word" | "phrase" | "sentence";

export const FLUENCY_RUNG_ORDER: FluencyRung[] = [
  "word",
  "phrase",
  "sentence",
];

export type AttackSpeechPrompt = {
  rung: FluencyRung;
  expectedText: string;
  keywords: string[];
  hintCn: string;
  hintEn: string;
  /** TTS / listen demo text. */
  demoText: string;
  /** Manual confirm button copy. */
  manualLabelCn: string;
  manualLabelEn: string;
  /** Prompt line above the attack button. */
  promptCn: string;
  promptEn: string;
};

export type AttackSpeechLadder = Record<FluencyRung, AttackSpeechPrompt>;

/** Material word woven into the full-sentence rung (zone-aware). */
function sentenceMaterialWord(zoneId?: ExploreZoneId | null): string {
  const zone = getExploreZoneById(zoneId);
  if (zone?.focusResource === "iron") return "iron";
  if (zone?.focusResource === "stone") return "stone";
  return "wood";
}

/**
 * Full fluency ladder for one monster (MW-19).
 * word → short phrase → full sentence; scoring stays lenient keywords.
 */
export function getAttackSpeechLadder(
  wordId: string,
  zoneId?: ExploreZoneId | null,
): AttackSpeechLadder {
  const word = getVocabularyById(wordId);
  const english = word?.english ?? wordId;
  const name = english.toLowerCase();
  const material = sentenceMaterialWord(zoneId);

  const wordPrompt: AttackSpeechPrompt = {
    rung: "word",
    expectedText: english,
    keywords: [english],
    hintCn: `说单词：${english}`,
    hintEn: `Say the word: ${english}`,
    demoText: english,
    manualLabelCn: "我说出了单词",
    manualLabelEn: "I said the word",
    promptCn: "先说单词也能打，但伤害较小！",
    promptEn: "A single word hits — but for less damage!",
  };

  const phrasePrompt: AttackSpeechPrompt = {
    rung: "phrase",
    expectedText: `Attack ${name}`,
    keywords: ["attack", name],
    hintCn: `说短句：Attack ${name}`,
    hintEn: `Say a short phrase: Attack ${name}`,
    demoText: `Attack ${name}`,
    manualLabelCn: "我说出了短句",
    manualLabelEn: "I said the phrase",
    promptCn: "说短句，伤害更大！",
    promptEn: "Say the short phrase for more damage!",
  };

  const sentenceText = `I attack the ${name} with ${material}`;
  const sentencePrompt: AttackSpeechPrompt = {
    rung: "sentence",
    expectedText: sentenceText,
    keywords: ["attack", name, material],
    hintCn: `说完整句：${sentenceText}`,
    hintEn: `Say a full sentence: ${sentenceText}`,
    demoText: sentenceText,
    manualLabelCn: "我说出了句子",
    manualLabelEn: "I said the sentence",
    promptCn: "说完整句子，打满伤害！",
    promptEn: "Say the full English sentence for max damage!",
  };

  return {
    word: wordPrompt,
    phrase: phrasePrompt,
    sentence: sentencePrompt,
  };
}

/**
 * Suggested prompt for the current fight step.
 * Zone attackSpeech is the starting rung floor (forest word · cave phrase · mines sentence).
 */
export function getAttackSpeechForMonster(
  wordId: string,
  zoneId?: ExploreZoneId | null,
  suggestedRung?: FluencyRung,
): AttackSpeechPrompt {
  const ladder = getAttackSpeechLadder(wordId, zoneId);
  const zone = getExploreZoneById(zoneId);
  const floor: FluencyRung = zone?.attackSpeech ?? "word";
  const rung = suggestedRung ?? floor;
  return ladder[rung];
}

export function nextFluencyRung(rung: FluencyRung): FluencyRung | null {
  const index = FLUENCY_RUNG_ORDER.indexOf(rung);
  if (index < 0 || index >= FLUENCY_RUNG_ORDER.length - 1) return null;
  return FLUENCY_RUNG_ORDER[index + 1] ?? null;
}

export function fluencyRungIndex(rung: FluencyRung): number {
  return FLUENCY_RUNG_ORDER.indexOf(rung);
}
