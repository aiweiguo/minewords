"use client";

import { useEffect, useMemo, useState } from "react";

import { SpeakButton } from "@/components/SpeakButton";
import { getVocabularyById } from "@/data/vocabulary";
import { validateStep } from "@/lib/questEngine";
import { buildMonsterQuizSteps } from "@/lib/monsterQuiz";
import { getWordMonsterLabel } from "@/lib/wrongWord";
import { speak } from "@/lib/speak";
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

  const [stepIndex, setStepIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [quizPassed, setQuizPassed] = useState(false);

  const currentStep = steps[stepIndex];

  useEffect(() => {
    if (currentStep?.type === "word-listening") {
      speak(currentStep.speakText);
    }
  }, [currentStep]);

  if (!word || !currentStep) {
    return null;
  }

  function handleCheck() {
    if (!selectedAnswer || feedback) return;
    const correct = validateStep(currentStep, selectedAnswer);
    if (correct) {
      setFeedback("Great! 答对了！");
    } else {
      setFeedback(`Almost! 正确答案是：${currentStep.answer}`);
    }
  }

  function handleNext() {
    if (feedback?.startsWith("Almost")) {
      setSelectedAnswer(null);
      setFeedback(null);
      return;
    }

    if (stepIndex >= steps.length - 1) {
      setQuizPassed(true);
      return;
    }

    setStepIndex((value) => value + 1);
    setSelectedAnswer(null);
    setFeedback(null);
  }

  function handleDefeat() {
    defeatMonster(wordId);
  }

  return (
    <section className="mw-card mw-reward-panel p-6">
      <div className="flex items-center gap-4">
        <span className="text-5xl mw-map-pulse">{monster.emoji}</span>
        <div>
          <h2 className="text-2xl font-black">{monster.titleCn}</h2>
          <p className="font-bold text-secondary">{monster.title}</p>
          <p className="text-sm text-muted">错了 {wrongCount} 次 · 复习 {stepIndex + 1}/{steps.length}</p>
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

      {!quizPassed ? (
        <div className="mt-6 space-y-4">
          <p className="font-black">{currentStep.prompt}</p>
          {currentStep.type === "word-listening" ? (
            <SpeakButton text={currentStep.speakText} label="再听一次 Replay" />
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            {currentStep.options.map((option) => (
              <button
                key={option}
                type="button"
                disabled={Boolean(feedback)}
                onClick={() => setSelectedAnswer(option)}
                className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-bold transition-transform ${
                  selectedAnswer === option
                    ? "border-primary bg-primary/15 scale-[1.02]"
                    : "border-[#d9e2cc] bg-black/10"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {feedback ? (
            <p
              className={`rounded-xl px-4 py-3 text-center text-sm font-bold ${
                feedback.startsWith("Great")
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-900"
              }`}
            >
              {feedback}
            </p>
          ) : null}

          <div className="text-center">
            {!feedback ? (
              <button
                type="button"
                className="mw-btn mw-btn-primary"
                disabled={!selectedAnswer}
                onClick={handleCheck}
              >
                Check 检查
              </button>
            ) : (
              <button type="button" className="mw-btn mw-btn-secondary" onClick={handleNext}>
                {feedback.startsWith("Almost") ? "Try Again 再试" : "Next 下一题"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-4 text-center">
          <p className="text-lg font-black text-primary">
            You defeated the {word.english} Word Monster!
          </p>
          <p className="font-bold">你击败了 {word.chinese} 单词怪！+10 XP</p>
          <button type="button" onClick={handleDefeat} className="mw-btn mw-btn-glow w-full">
            领取奖励 Claim Reward
          </button>
        </div>
      )}
    </section>
  );
}
