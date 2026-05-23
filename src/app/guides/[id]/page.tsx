"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";

import { GuideQuizRunner } from "@/components/GuideQuizRunner";
import { guideCategoryLabels, getGuideById } from "@/data/guides";
import { useGameStore } from "@/store/useGameStore";
import { GuideKeyword } from "@/types";

type GuideDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { id } = use(params);
  const entry = getGuideById(id);

  const discoverWord = useGameStore((s) => s.discoverWord);
  const completedGuideIds = useGameStore((s) => s.completedGuideIds);

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  if (!entry) {
    notFound();
  }

  const keywordIds = entry.keywords.map((k) => k.wordId);
  const categoryLabel = guideCategoryLabels[entry.category];
  const completed = completedGuideIds.includes(entry.id);

  function handleViewKeywords(words: GuideKeyword[]) {
    for (const kw of words) {
      discoverWord(kw.wordId);
    }
  }

  return (
    <main className="space-y-6">
      <Link href="/guides" className="text-sm font-bold text-primary">
        ← 返回攻略库
      </Link>

      <section className="mw-card p-6">
        <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-black text-primary">
          {categoryLabel.cn}
        </span>
        <h1 className="mt-3 text-3xl font-black">{entry.title}</h1>
        <p className="text-xl font-bold text-secondary">{entry.titleCn}</p>

        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-black">中文攻略</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed">{entry.summaryCn}</p>
          </div>
          <div>
            <h2 className="text-lg font-black">Simple English</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed">{entry.simpleEnglish}</p>
          </div>
        </div>

        {entry.materials.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-lg font-black">你需要 Materials</h2>
            <ul className="mt-2 space-y-1 text-sm font-semibold">
              {entry.materials.map((m) => (
                <li key={`${m.english}-${m.chinese}`}>
                  - {m.english} {m.chinese}
                  {m.amount ? ` ${m.amount}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6">
          <h2 className="text-lg font-black">步骤 Steps</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm font-semibold">
            {entry.steps.map((step) => (
              <li key={step.en}>
                {step.cn}
                <br />
                <span className="text-muted">{step.en}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-black">Key Words 关键词</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {entry.keywords.map((kw) => (
              <Link
                key={kw.wordId}
                href={`/dictionary/${kw.wordId}`}
                onClick={() => discoverWord(kw.wordId)}
                className="rounded-full bg-[#eef6e4] px-3 py-1 text-sm font-bold text-primary"
              >
                {kw.english} {kw.chinese}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {entry.relatedQuestId ? (
            <Link
              href={`/quests/${entry.relatedQuestId}`}
              className="mw-btn mw-btn-primary"
              onClick={() => handleViewKeywords(entry.keywords)}
            >
              Start Learning Quest 开始任务
            </Link>
          ) : null}
          <button
            type="button"
            className="mw-btn mw-btn-secondary"
            onClick={() => {
              handleViewKeywords(entry.keywords);
              setShowQuiz(true);
            }}
          >
            Learn these words 学这些单词
          </button>
        </div>

        {completed ? (
          <p className="mt-4 text-sm font-bold text-green-700">✓ 已完成本篇攻略学习</p>
        ) : null}
      </section>

      {showQuiz ? (
        <GuideQuizRunner
          guideId={entry.id}
          steps={entry.quizSteps}
          keywordIds={keywordIds}
          onComplete={(first) => {
            setQuizDone(true);
            if (first) handleViewKeywords(entry.keywords);
          }}
        />
      ) : null}

      {quizDone ? (
        <section className="mw-card p-4 text-center font-bold text-primary">
          继续冒险！去 MineDex 查看新学会的单词 →{" "}
          <Link href="/minedex" className="underline">
            MineDex
          </Link>
        </section>
      ) : null}
    </main>
  );
}
