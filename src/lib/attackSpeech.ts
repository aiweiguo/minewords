import { ExploreZoneId, getExploreZoneById } from "@/data/exploreZones";
import { getVocabularyById } from "@/data/vocabulary";

export type AttackSpeechPrompt = {
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

/**
 * Weapon-tier speak-attack prompts (MW-18).
 * Forest: single word · Cave: short phrase · Mines: full sentence.
 * Scoring stays lenient keyword match via scoreSpeechAttempt.
 */
export function getAttackSpeechForMonster(
  wordId: string,
  zoneId?: ExploreZoneId | null,
): AttackSpeechPrompt {
  const word = getVocabularyById(wordId);
  const english = word?.english ?? wordId;
  const name = english.toLowerCase();
  const zone = getExploreZoneById(zoneId);
  const mode = zone?.attackSpeech ?? "word";

  if (mode === "sentence") {
    const expectedText = `I attack the ${name} with iron`;
    return {
      expectedText,
      keywords: ["attack", name, "iron"],
      hintCn: `说完整句：${expectedText}`,
      hintEn: `Say a full sentence: ${expectedText}`,
      demoText: expectedText,
      manualLabelCn: "我说出了句子",
      manualLabelEn: "I said the sentence",
      promptCn: "大声说出完整句子，打中怪物！",
      promptEn: "Say the full English sentence to hit!",
    };
  }

  if (mode === "phrase") {
    const expectedText = `Attack ${name}`;
    return {
      expectedText,
      keywords: ["attack", name],
      hintCn: `说短句：Attack ${name}`,
      hintEn: `Say a short phrase: Attack ${name}`,
      demoText: expectedText,
      manualLabelCn: "我说出了短句",
      manualLabelEn: "I said the phrase",
      promptCn: "大声说出短句，打中怪物！",
      promptEn: "Say the short English phrase to hit!",
    };
  }

  return {
    expectedText: english,
    keywords: [english],
    hintCn: `说单词：${english}`,
    hintEn: `Say the word: ${english}`,
    demoText: english,
    manualLabelCn: "我说出了",
    manualLabelEn: "I said it",
    promptCn: "大声说出英文单词，打中怪物！",
    promptEn: "Say the English word to hit!",
  };
}
