import { vocabulary } from "@/data/vocabulary";
import { getVocabularyById } from "@/data/vocabulary";
import { QuestStep } from "@/types";

export function resolveWordIdFromText(text: string): string | undefined {
  const normalized = text.trim().toLowerCase();
  const exact = vocabulary.find(
    (w) =>
      w.english.toLowerCase() === normalized ||
      w.chinese === text.trim() ||
      w.id === normalized,
  );
  if (exact) return exact.id;

  return vocabulary.find((w) => normalized.includes(w.english.toLowerCase()))?.id;
}

export function resolveWordIdFromStep(step: QuestStep): string | undefined {
  if (step.type === "word-listening") {
    return resolveWordIdFromText(step.speakText);
  }
  if (step.type === "word-choice") {
    return resolveWordIdFromText(step.answer) ?? resolveWordIdFromText(step.prompt);
  }
  if (step.type === "crafting") {
    return step.requiredWords[0];
  }
  return undefined;
}

export function getWordMonsterLabel(wordId: string): {
  title: string;
  titleCn: string;
  emoji: string;
} {
  const word = getVocabularyById(wordId);
  const mobEmoji: Record<string, string> = {
    zombie: "🧟",
    skeleton: "💀",
    creeper: "💥",
    spider: "🕷️",
    wolf: "🐺",
  };
  const emoji = mobEmoji[wordId] ?? "👾";
  return {
    title: `${word?.english ?? wordId} Word Monster`,
    titleCn: `${word?.chinese ?? wordId} 单词怪`,
    emoji,
  };
}

export const MONSTER_WRONG_THRESHOLD = 2;
