"use client";

import { useEffect, useState } from "react";

import { SpeakButton } from "@/components/SpeakButton";
import { validateStep } from "@/lib/questEngine";
import { resolveWordIdFromStep } from "@/lib/wrongWord";
import { speak } from "@/lib/speak";
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
  const recordCorrectAnswer = useGameStore((state) => state.recordCorrectAnswer);
  const recordWrongWord = useGameStore((state) => state.recordWrongWord);
  const completeGuide = useGameStore((state) => state.completeGuide);
  const completedGuideIds = useGameStore((state) => state.completedGuideIds);
  const markWordLearned = useGameStore((state) => state.markWordLearned);

  const practiceMode = completedGuideIds.includes(guideId);

  const [stepIndex, setStepIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(
    null,
  );
  const [finished, setFinished] = useState(false);

  const currentStep = steps[stepIndex];

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
    if (stepIndex < steps.length - 1) {
      setStepIndex((v) => v + 1);
      setSelectedAnswer(null);
      setFeedback(null);
      return;
    }

    setFinished(true);
    for (const wordId of keywordIds) {
      markWordLearned(wordId);
    }
    const first = practiceMode ? false : completeGuide(guideId, keywordIds);
    onComplete(first);
  }

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

  if (!currentStep) return null;

  return (
    <section className="mw-card p-6">
      <p className="text-sm font-bold text-muted">
        Quiz {stepIndex + 1} / {steps.length}
      </p>
      <h2 className="mt-2 text-xl font-black">{currentStep.prompt}</h2>

      {currentStep.type === "word-listening" ? (
        <div className="mt-4">
          <SpeakButton text={currentStep.speakText} />
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        {currentStep.options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={Boolean(feedback)}
            onClick={() => setSelectedAnswer(option)}
            className={`rounded-xl border-2 px-4 py-3 text-left font-bold ${
              selectedAnswer === option
                ? "border-primary bg-primary/10"
                : "border-[#d9e2cc] bg-white"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {feedback ? (
        <p
          className={`mt-4 rounded-xl px-4 py-3 font-bold ${
            feedback.isCorrect ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"
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
            {stepIndex >= steps.length - 1 ? "Finish 完成" : "Next 下一题"}
          </button>
        )}
      </div>
    </section>
  );
}
