"use client";

import Link from "next/link";

import { WordMonsterCard } from "@/components/WordMonsterCard";
import { MONSTER_WRONG_THRESHOLD } from "@/lib/wrongWord";
import { getVocabularyById } from "@/data/vocabulary";
import { useGameStore } from "@/store/useGameStore";

export default function ReviewPage() {
  const wrongWordCounts = useGameStore((s) => s.wrongWordCounts);
  const defeatedMonsterIds = useGameStore((s) => s.defeatedMonsterIds);

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
          同一个词错 {MONSTER_WRONG_THRESHOLD} 次以上会变成「单词怪」。完成 3 道复习题才能击败它！
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
        activeMonsters.map(([wordId, count]) => (
          <WordMonsterCard key={wordId} wordId={wordId} wrongCount={count} />
        ))
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
