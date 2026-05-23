import { vocabulary } from "@/data/vocabulary";
import { QuestStep } from "@/types";
import { shuffleArray } from "@/lib/shuffle";

function pickDistractors(wordId: string, count: number): string[] {
  const word = vocabulary.find((item) => item.id === wordId);
  if (!word) return [];

  const sameCategory = vocabulary.filter(
    (item) => item.id !== wordId && item.category === word.category,
  );
  const fallback = vocabulary.filter((item) => item.id !== wordId);
  const pool = sameCategory.length >= count ? sameCategory : fallback;

  return shuffleArray(pool)
    .slice(0, count)
    .map((item) => item.chinese);
}

export function buildMonsterQuizSteps(wordId: string): QuestStep[] {
  const word = vocabulary.find((item) => item.id === wordId);
  if (!word) {
    return [];
  }

  const distractors = pickDistractors(wordId, 2);
  const meaningOptions = shuffleArray([word.chinese, ...distractors]);

  const englishDistractors = shuffleArray(
    vocabulary.filter((item) => item.id !== wordId),
  )
    .slice(0, 2)
    .map((item) => item.english);
  const englishOptions = shuffleArray([word.english, ...englishDistractors]);

  const sentenceDistractors = shuffleArray(
    vocabulary.filter((item) => item.id !== wordId),
  )
    .slice(0, 2)
    .map((item) => item.example);

  return [
    {
      id: `${wordId}-meaning`,
      type: "word-choice",
      prompt: `${word.english} 是什么意思？`,
      options: meaningOptions,
      answer: word.chinese,
      explanation: `${word.english} = ${word.chinese}`,
    },
    {
      id: `${wordId}-listening`,
      type: "word-listening",
      speakText: word.english,
      prompt: "听发音，选择正确的英文单词：",
      options: englishOptions,
      answer: word.english,
    },
    {
      id: `${wordId}-sentence`,
      type: "word-choice",
      prompt: `哪一句用了 ${word.english}？`,
      options: shuffleArray([word.example, ...sentenceDistractors]),
      answer: word.example,
      explanation: word.exampleCn,
    },
  ];
}
