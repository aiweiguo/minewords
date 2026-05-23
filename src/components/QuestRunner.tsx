"use client";

import { useEffect, useState } from "react";

import { SpeakButton } from "@/components/SpeakButton";
import { validateStep } from "@/lib/questEngine";
import { speak } from "@/lib/speak";
import { resolveWordIdFromStep } from "@/lib/wrongWord";
import { useGameStore } from "@/store/useGameStore";
import { Quest, QuestStep } from "@/types";

type QuestRunnerProps = {
  quest: Quest;
  practiceMode: boolean;
  onComplete: (isFirstCompletion: boolean) => void;
};

type FeedbackState = {
  message: string;
  isCorrect: boolean;
} | null;

export function QuestRunner({ quest, practiceMode, onComplete }: QuestRunnerProps) {
  const recordCorrectAnswer = useGameStore((state) => state.recordCorrectAnswer);
  const recordWrongWord = useGameStore((state) => state.recordWrongWord);
  const completeQuest = useGameStore((state) => state.completeQuest);

  const [stepIndex, setStepIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [finished, setFinished] = useState(false);

  const currentStep: QuestStep | undefined = quest.steps[stepIndex];

  useEffect(() => {
    if (currentStep?.type === "word-listening") {
      speak(currentStep.speakText);
    }
  }, [currentStep]);

  function handleSubmit() {
    if (!currentStep || !selectedAnswer || feedback) return;

    const isCorrect = validateStep(currentStep, selectedAnswer);

    if (isCorrect) {
      recordCorrectAnswer();
      setFeedback({ message: "Great! 答对了！", isCorrect: true });
    } else {
      const wordId = resolveWordIdFromStep(currentStep);
      if (wordId) recordWrongWord(wordId);
      setFeedback({
        message: `Almost! 正确答案是：${currentStep.answer}`,
        isCorrect: false,
      });
    }
  }

  function handleNext() {
    if (!feedback) return;

    const isLastStep = stepIndex >= quest.steps.length - 1;

    if (!isLastStep) {
      setStepIndex((value) => value + 1);
      setSelectedAnswer(null);
      setFeedback(null);
      return;
    }

    setFinished(true);
    const result = practiceMode ? null : completeQuest(quest.id);
    onComplete(result?.isFirstCompletion ?? false);
  }

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

  if (!currentStep) return null;

  return (
    <section className="mw-card p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-muted">
          Step {stepIndex + 1} / {quest.steps.length}
        </p>
        <span className="rounded-full bg-[#eef6e4] px-3 py-1 text-xs font-bold text-primary">
          {currentStep.type}
        </span>
      </div>

      <h2 className="text-2xl font-black">{currentStep.prompt}</h2>

      {currentStep.type === "word-listening" ? (
        <div className="mt-4">
          <SpeakButton text={currentStep.speakText} />
        </div>
      ) : null}

      {currentStep.type === "crafting" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {currentStep.requiredWords.map((word) => (
            <span
              key={word}
              className="rounded-full bg-secondary/15 px-3 py-1 text-sm font-bold text-secondary"
            >
              {word}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3">
        {currentStep.options.map((option) => {
          const isSelected = selectedAnswer === option;
          return (
            <button
              key={option}
              type="button"
              disabled={Boolean(feedback)}
              onClick={() => setSelectedAnswer(option)}
              className={`rounded-xl border-2 px-4 py-4 text-left text-base font-bold transition-colors ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[#d9e2cc] bg-white hover:bg-[#f5f7ef]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {feedback ? (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-base font-bold ${
            feedback.isCorrect
              ? "bg-green-100 text-green-800"
              : "bg-amber-100 text-amber-900"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {!feedback ? (
          <button
            type="button"
            className="mw-btn mw-btn-primary"
            disabled={!selectedAnswer}
            onClick={handleSubmit}
          >
            Check Answer 检查答案
          </button>
        ) : (
          <button type="button" className="mw-btn mw-btn-secondary" onClick={handleNext}>
            {stepIndex >= quest.steps.length - 1 ? "Finish 完成" : "Next 下一题"}
          </button>
        )}
      </div>
    </section>
  );
}
