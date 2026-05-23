"use client";

import { useEffect, useState } from "react";

import { SpeakButton } from "@/components/SpeakButton";
import { validateStep } from "@/lib/questEngine";
import { resolveWordIdFromStep } from "@/lib/wrongWord";
import { speak } from "@/lib/speak";
import { useGameStore } from "@/store/useGameStore";
import { QuestStep } from "@/types";

type QuizStepRunnerProps = {
  steps: QuestStep[];
  practiceMode?: boolean;
  stepLabel?: string;
  onStepWrong?: (step: QuestStep) => void;
  onComplete: () => void;
};

export function QuizStepRunner({
  steps,
  practiceMode = false,
  stepLabel = "Step",
  onStepWrong,
  onComplete,
}: QuizStepRunnerProps) {
  const recordCorrectAnswer = useGameStore((s) => s.recordCorrectAnswer);
  const recordWrongWord = useGameStore((s) => s.recordWrongWord);

  const [stepIndex, setStepIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(
    null,
  );

  const currentStep = steps[stepIndex];

  useEffect(() => {
    if (currentStep?.type === "word-listening") {
      speak(currentStep.speakText);
    }
  }, [currentStep]);

  if (!currentStep) return null;

  function handleSubmit() {
    if (!selectedAnswer || feedback) return;
    const isCorrect = validateStep(currentStep, selectedAnswer);
    if (isCorrect) {
      recordCorrectAnswer({ practiceMode });
      setFeedback({ message: "Great! 答对了！", isCorrect: true });
    } else {
      const wordId = resolveWordIdFromStep(currentStep);
      if (wordId) recordWrongWord(wordId);
      onStepWrong?.(currentStep);
      setFeedback({
        message: `Almost! 正确答案是：${currentStep.answer}`,
        isCorrect: false,
      });
    }
  }

  function handleNext() {
    if (!feedback) return;

    if (feedback.isCorrect === false) {
      setSelectedAnswer(null);
      setFeedback(null);
      return;
    }

    if (stepIndex >= steps.length - 1) {
      onComplete();
      return;
    }

    setStepIndex((value) => value + 1);
    setSelectedAnswer(null);
    setFeedback(null);
  }

  return (
    <section className="mw-card p-6">
      <p className="text-sm font-bold text-muted">
        {stepLabel} {stepIndex + 1} / {steps.length}
        {practiceMode ? " · 练习模式" : ""}
      </p>
      <h2 className="mt-2 text-xl font-black">{currentStep.prompt}</h2>

      {currentStep.type === "word-listening" ? (
        <div className="mt-4">
          <SpeakButton text={currentStep.speakText} label="再听一次 Replay" />
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

      <div className="mt-4 grid gap-3">
        {currentStep.options.map((option, index) => (
          <button
            key={`${currentStep.id}-${index}`}
            type="button"
            disabled={Boolean(feedback)}
            onClick={() => setSelectedAnswer(option)}
            className={`mw-input-option rounded-xl border-2 px-4 py-3 text-left font-bold ${
              selectedAnswer === option
                ? "border-primary bg-primary/10 text-primary"
                : "border-[#8B6914]/40 bg-black/20"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {feedback ? (
        <p
          className={`mt-4 rounded-xl px-4 py-3 font-bold ${
            feedback.isCorrect ? "bg-green-900/40 text-green-200" : "bg-amber-900/40 text-amber-100"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <div className="mt-4">
        {!feedback ? (
          <button
            type="button"
            className="mw-btn mw-btn-primary"
            disabled={!selectedAnswer}
            onClick={handleSubmit}
          >
            Check 检查
          </button>
        ) : (
          <button type="button" className="mw-btn mw-btn-secondary" onClick={handleNext}>
            {feedback.isCorrect
              ? stepIndex >= steps.length - 1
                ? "Finish 完成"
                : "Next 下一题"
              : "Try Again 再试"}
          </button>
        )}
      </div>
    </section>
  );
}
