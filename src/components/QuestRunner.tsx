"use client";

import { useState } from "react";

import { QuizStepRunner } from "@/components/QuizStepRunner";
import { useGameStore } from "@/store/useGameStore";
import { Quest } from "@/types";

type QuestRunnerProps = {
  quest: Quest;
  practiceMode: boolean;
  onComplete: (isFirstCompletion: boolean) => void;
};

export function QuestRunner({ quest, practiceMode, onComplete }: QuestRunnerProps) {
  const completeQuest = useGameStore((state) => state.completeQuest);
  const [finished, setFinished] = useState(false);

  if (finished) {
    return (
      <section className="mw-card p-6 text-center">
        <p className="text-2xl font-black text-primary">All steps done! 全部完成！</p>
        {practiceMode ? (
          <p className="mt-2 text-sm text-muted">练习模式，无额外奖励</p>
        ) : null}
      </section>
    );
  }

  return (
    <QuizStepRunner
      steps={quest.steps}
      practiceMode={practiceMode}
      stepLabel="Step"
      onComplete={() => {
        setFinished(true);
        const result = practiceMode ? null : completeQuest(quest.id);
        onComplete(result?.isFirstCompletion ?? false);
      }}
    />
  );
}
