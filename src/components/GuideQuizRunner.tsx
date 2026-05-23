"use client";

import { useState } from "react";

import { QuizStepRunner } from "@/components/QuizStepRunner";
import { useGameStore } from "@/store/useGameStore";
import { QuestStep } from "@/types";

type GuideQuizRunnerProps = {
  guideId: string;
  steps: QuestStep[];
  keywordIds: string[];
  onComplete: (firstCompletion: boolean) => void;
};

export function GuideQuizRunner({
  guideId,
  steps,
  keywordIds,
  onComplete,
}: GuideQuizRunnerProps) {
  const completeGuide = useGameStore((state) => state.completeGuide);
  const markWordsLearned = useGameStore((state) => state.markWordsLearned);
  const completedGuideIds = useGameStore((state) => state.completedGuideIds);

  const practiceMode = completedGuideIds.includes(guideId);
  const [finished, setFinished] = useState(false);

  if (finished) {
    return (
      <section className="mw-card p-6 text-center">
        <p className="text-2xl font-black text-primary">Guide Quiz Complete!</p>
        {practiceMode ? (
          <p className="mt-2 text-sm text-muted">练习模式，无额外奖励</p>
        ) : null}
      </section>
    );
  }

  return (
    <QuizStepRunner
      steps={steps}
      practiceMode={practiceMode}
      stepLabel="Quiz"
      onComplete={() => {
        setFinished(true);
        if (practiceMode) {
          markWordsLearned(keywordIds);
          onComplete(false);
          return;
        }
        const first = completeGuide(guideId, keywordIds);
        onComplete(first);
      }}
    />
  );
}
