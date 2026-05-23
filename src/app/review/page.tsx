"use client";

import Link from "next/link";

import { SpeakButton } from "@/components/SpeakButton";
import { getVocabularyById } from "@/data/vocabulary";
import {
  getWordMonsterLabel,
  MONSTER_WRONG_THRESHOLD,
} from "@/lib/wrongWord";
import { useGameStore } from "@/store/useGameStore";

export default function ReviewPage() {
  const wrongWordCounts = useGameStore((s) => s.wrongWordCounts);
  const defeatedMonsterIds = useGameStore((s) => s.defeatedMonsterIds);
  const defeatMonster = useGameStore((s) => s.defeatMonster);

  const activeMonsters = Object.entries(wrongWordCounts)
    .filter(
      ([wordId, count]) =>
        count >= MONSTER_WRONG_THRESHOLD && !defeatedMonsterIds.includes(wordId),
    )
    .sort((a, b) => b[1] - a[1]);

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Word Monsters</h1>
        <p className="mt-1 text-xl font-bold">错词怪物</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          同一个词错 {MONSTER_WRONG_THRESHOLD} 次以上会变成「单词怪」。复习成功就能击败它！
        </p>
      </section>

      {activeMonsters.length === 0 ? (
        <section className="mw-card p-8 text-center">
          <p className="text-4xl">✨</p>
          <p className="mt-4 text-lg font-bold">目前没有单词怪，继续保持！</p>
          <Link href="/quests" className="mw-btn mw-btn-primary mt-6 inline-flex">
            去做任务 →
          </Link>
        </section>
      ) : (
        activeMonsters.map(([wordId, count]) => {
          const word = getVocabularyById(wordId);
          const monster = getWordMonsterLabel(wordId);
          return (
            <section key={wordId} className="mw-card mw-reward-panel p-6">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{monster.emoji}</span>
                <div>
                  <h2 className="text-2xl font-black">{monster.titleCn}</h2>
                  <p className="font-bold text-secondary">{monster.title}</p>
                  <p className="text-sm text-muted">错了 {count} 次</p>
                </div>
              </div>

              {word ? (
                <div className="mt-4 rounded-xl bg-black/20 p-4">
                  <p className="text-xl font-black">{word.english}</p>
                  <p className="font-bold">{word.chinese}</p>
                  <p className="mt-2 text-sm">{word.example}</p>
                  <p className="text-sm text-muted">{word.exampleCn}</p>
                  <div className="mt-4">
                    <SpeakButton text={word.english} />
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => defeatMonster(wordId)}
                className="mw-btn mw-btn-primary mt-6 w-full"
              >
                我学会了！击败怪物 Defeat
              </button>
            </section>
          );
        })
      )}

      {defeatedMonsterIds.length > 0 ? (
        <section className="mw-card p-5">
          <h2 className="text-lg font-black">已击败</h2>
          <p className="mt-2 text-sm font-semibold text-muted">
            {defeatedMonsterIds
              .map((id) => getVocabularyById(id)?.english ?? id)
              .join("、")}
          </p>
        </section>
      ) : null}
    </main>
  );
}
