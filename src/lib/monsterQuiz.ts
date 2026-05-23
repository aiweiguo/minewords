import { getVocabularyById, vocabulary } from "@/data/vocabulary";
import { QuestStep } from "@/types";

function pickDistractors(wordId: string, count: number): string[] {
  const word = getVocabularyById(wordId);
  if (!word) return [];

  return vocabulary
    .filter((item) => item.id !== wordId && item.category === word.category)
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map((item) => item.chinese);
}

export function buildMonsterQuizSteps(wordId: string): QuestStep[] {
  const word = getVocabularyById(wordId);
  if (!word) {
    return [];
  }

  const distractors = pickDistractors(wordId, 2);
  const meaningOptions = [word.chinese, ...distractors].sort(() => Math.random() - 0.5);

  const englishDistractors = vocabulary
    .filter((item) => item.id !== wordId)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .map((item) => item.english);
  const englishOptions = [word.english, ...englishDistractors].sort(() => Math.random() - 0.5);

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
      options: [word.example, ...vocabulary.filter((w) => w.id !== wordId).slice(0, 2).map((w) => w.example)].sort(
        () => Math.random() - 0.5,
      ),
      answer: word.example,
      explanation: word.exampleCn,
    },
  ];
}
