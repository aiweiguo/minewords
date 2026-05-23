"use client";

import { useEffect, useMemo, useState } from "react";

import { GameIcon } from "@/components/GameIcon";
import { SpeakButton } from "@/components/SpeakButton";
import { vocabulary } from "@/data/vocabulary";
import { getVocabularyIcon } from "@/lib/assets";
import { speak } from "@/lib/speak";
import { useGameStore } from "@/store/useGameStore";

const QUIZ_LENGTH = 5;

function pickQuizWords(seed: number) {
  const pool = [...vocabulary];
  const selected = [];
  let s = seed;
  for (let i = 0; i < QUIZ_LENGTH && pool.length > 0; i += 1) {
    s = (s * 1103515245 + 12345) >>> 0;
    const index = s % pool.length;
    selected.push(pool.splice(index, 1)[0]);
  }
  return selected;
}

function buildOptions(correctId: string, count = 4) {
  const correct = vocabulary.find((w) => w.id === correctId)!;
  const others = vocabulary
    .filter((w) => w.id !== correctId)
    .sort(() => Math.random() - 0.5)
    .slice(0, count - 1);
  return [correct, ...others].sort(() => Math.random() - 0.5);
}

export default function ListeningPage() {
  const recordCorrectAnswer = useGameStore((s) => s.recordCorrectAnswer);
  const markWordLearned = useGameStore((s) => s.markWordLearned);
  const discoverWord = useGameStore((s) => s.discoverWord);
  const recordWrongWord = useGameStore((s) => s.recordWrongWord);

  const [quizWords] = useState(() => pickQuizWords(Math.floor(Math.random() * 100000)));

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = quizWords[index];
  const options = useMemo(
    () => (current ? buildOptions(current.id) : []),
    [current],
  );

  useEffect(() => {
    if (current && !done) {
      speak(current.english);
    }
  }, [current, done]);

  if (!current) {
    return null;
  }

  function handleCheck() {
    if (!selected || feedback) return;
    const correct = selected === current.id;
    if (correct) {
      setScore((s) => s + 1);
      recordCorrectAnswer();
      markWordLearned(current.id);
      discoverWord(current.id);
      setFeedback("Great! 答对了！");
    } else {
      recordWrongWord(current.id);
      setFeedback(`Almost! 正确答案是：${current.chinese}`);
    }
  }

  function handleNext() {
    if (index >= quizWords.length - 1) {
      setDone(true);
      return;
    }
    setIndex((v) => v + 1);
    setSelected(null);
    setFeedback(null);
  }

  if (done) {
    return (
      <main className="space-y-6">
        <section className="mw-card mw-reward-panel p-8 text-center">
          <h1 className="text-3xl font-black text-primary">Listening Complete!</h1>
          <p className="mt-2 text-xl font-bold">
            得分：{score} / {quizWords.length}
          </p>
          <button
            type="button"
            className="mw-btn mw-btn-primary mt-6"
            onClick={() => window.location.reload()}
          >
            再玩一次 Try Again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Listening Quiz</h1>
        <p className="mt-1 text-xl font-bold">听音选词</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          听英文发音，选出正确的物品。第 {index + 1} / {quizWords.length} 题
        </p>
        <div className="mt-4">
          <SpeakButton text={current.english} label="再听一次 Replay" />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        {options.map((word) => (
          <button
            key={word.id}
            type="button"
            disabled={Boolean(feedback)}
            onClick={() => setSelected(word.id)}
            className={`mw-card flex flex-col items-center p-4 transition-transform ${
              selected === word.id ? "ring-4 ring-primary scale-[1.02]" : ""
            }`}
          >
            <GameIcon src={getVocabularyIcon(word.id)} alt={word.english} size="xl" />
            <p className="mt-3 text-lg font-black">{word.chinese}</p>
          </button>
        ))}
      </section>

      {feedback ? (
        <p
          className={`rounded-xl px-4 py-3 text-center font-bold ${
            feedback.startsWith("Great") ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"
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
            disabled={!selected}
            onClick={handleCheck}
          >
            Check 检查
          </button>
        ) : (
          <button type="button" className="mw-btn mw-btn-secondary" onClick={handleNext}>
            Next 下一题
          </button>
        )}
      </div>
    </main>
  );
}
