"use client";

import { useMemo, useState } from "react";

import { QuizStepRunner } from "@/components/QuizStepRunner";
import { SpeakButton } from "@/components/SpeakButton";
import { getVocabularyById } from "@/data/vocabulary";
import { buildMonsterQuizSteps } from "@/lib/monsterQuiz";
import { getWordMonsterLabel } from "@/lib/wrongWord";
import { useGameStore } from "@/store/useGameStore";

type WordMonsterCardProps = {
  wordId: string;
  wrongCount: number;
};

export function WordMonsterCard({ wordId, wrongCount }: WordMonsterCardProps) {
  const defeatMonster = useGameStore((s) => s.defeatMonster);
  const steps = useMemo(() => buildMonsterQuizSteps(wordId), [wordId]);
  const word = getVocabularyById(wordId);
  const monster = getWordMonsterLabel(wordId);
  const [quizPassed, setQuizPassed] = useState(false);

  if (!word || steps.length === 0) {
    return null;
  }

  if (quizPassed) {
    return (
      <section className="mw-card mw-reward-panel p-6 text-center">
        <p className="text-lg font-black text-primary">
          You defeated the {word.english} Word Monster!
        </p>
        <p className="mt-2 font-bold">你击败了 {word.chinese} 单词怪！+10 XP</p>
        <button
          type="button"
          onClick={() => defeatMonster(wordId)}
          className="mw-btn mw-btn-glow mt-6 w-full"
        >
          领取奖励 Claim Reward
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="mw-card mw-reward-panel p-6">
        <div className="flex items-center gap-4">
          <span className="text-5xl mw-map-pulse">{monster.emoji}</span>
          <div>
            <h2 className="text-2xl font-black">{monster.titleCn}</h2>
            <p className="font-bold text-secondary">{monster.title}</p>
            <p className="text-sm text-muted">错了 {wrongCount} 次</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-black/20 p-4">
          <p className="text-xl font-black">{word.english}</p>
          <p className="font-bold">{word.chinese}</p>
          <p className="mt-2 text-sm">{word.example}</p>
          <p className="text-sm text-muted">{word.exampleCn}</p>
          <div className="mt-4">
            <SpeakButton text={word.english} />
          </div>
        </div>
      </section>

      <QuizStepRunner
        steps={steps}
        stepLabel="Review"
        onComplete={() => setQuizPassed(true)}
      />
    </div>
  );
}
