"use client";

import Link from "next/link";

import { WeaponGoalStrip } from "@/components/WeaponGoalStrip";
import { WordMonsterCard } from "@/components/WordMonsterCard";
import { WILD_MONSTER_WORD_IDS } from "@/data/monsterDrops";
import { getVocabularyById } from "@/data/vocabulary";
import { getWeaponGoalSnapshot } from "@/lib/weaponGoal";
import { MONSTER_WRONG_THRESHOLD } from "@/lib/wrongWord";
import { useGameStore } from "@/store/useGameStore";

export default function ReviewPage() {
  const wrongWordCounts = useGameStore((s) => s.wrongWordCounts);
  const defeatedMonsterIds = useGameStore((s) => s.defeatedMonsterIds);
  const resources = useGameStore((s) => s.resources);
  const unlockedIds = useGameStore((s) => s.unlockedIds);

  const wildMonsters = WILD_MONSTER_WORD_IDS.filter(
    (wordId) => !defeatedMonsterIds.includes(wordId),
  );

  const wrongMonsters = Object.entries(wrongWordCounts)
    .filter(
      ([wordId, count]) =>
        count >= MONSTER_WRONG_THRESHOLD &&
        !defeatedMonsterIds.includes(wordId) &&
        !WILD_MONSTER_WORD_IDS.includes(
          wordId as (typeof WILD_MONSTER_WORD_IDS)[number],
        ),
    )
    .sort((a, b) => b[1] - a[1]);

  const hasAny = wildMonsters.length > 0 || wrongMonsters.length > 0;
  const goal = getWeaponGoalSnapshot(unlockedIds, resources);

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Word Monsters</h1>
        <p className="mt-1 text-xl font-bold">开口打怪</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          说出英文单词打中怪物，掉落合成材料！Say the word to attack — materials drop on
          hit.
        </p>
      </section>

      <WeaponGoalStrip variant="settle" />

      {!hasAny ? (
        <section className="mw-card p-8 text-center">
          <p className="text-4xl">✨</p>
          <p className="mt-4 text-lg font-bold">
            {goal.canCraft
              ? "怪物清完了 — 材料够了，去合成武器！"
              : "目前没有怪物，回基地看看武器架吧！"}
          </p>
          <p className="mt-2 text-sm font-semibold text-muted">
            {goal.canCraft
              ? "No monsters left — speak-craft your sword."
              : "No monsters left — check the weapon rack at home."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={goal.primaryCta.href}
              className="mw-btn mw-btn-primary inline-flex"
            >
              {goal.primaryCta.labelCn} →
            </Link>
            <Link href="/" className="mw-btn mw-btn-outline inline-flex">
              基地 Home →
            </Link>
          </div>
        </section>
      ) : null}

      {wildMonsters.length > 0 ? (
        <section className="space-y-4">
          <h2 className="px-1 text-lg font-black">野外怪物 Wild Monsters</h2>
          {wildMonsters.map((wordId) => (
            <WordMonsterCard key={wordId} wordId={wordId} wild />
          ))}
        </section>
      ) : null}

      {wrongMonsters.length > 0 ? (
        <section className="space-y-4">
          <h2 className="px-1 text-lg font-black">错词怪物 Wrong-Word Monsters</h2>
          <p className="px-1 text-sm font-semibold text-muted">
            同一个词错 {MONSTER_WRONG_THRESHOLD} 次以上会出现。开口说出单词即可击败！
          </p>
          {wrongMonsters.map(([wordId, count]) => (
            <WordMonsterCard key={wordId} wordId={wordId} wrongCount={count} />
          ))}
        </section>
      ) : null}

      {defeatedMonsterIds.length > 0 ? (
        <section className="mw-card p-5">
          <h2 className="text-lg font-black">已击败 Defeated</h2>
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
