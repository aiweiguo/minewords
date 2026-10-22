"use client";

import Link from "next/link";
import { useMemo } from "react";

import { WordMonsterCard } from "@/components/WordMonsterCard";
import { WILD_MONSTER_WORD_IDS } from "@/data/monsterDrops";
import { getVocabularyById } from "@/data/vocabulary";
import { MONSTER_WRONG_THRESHOLD } from "@/lib/wrongWord";
import { useGameStore } from "@/store/useGameStore";

export default function ReviewPage() {
  const wrongWordCounts = useGameStore((s) => s.wrongWordCounts);
  const defeatedMonsterIds = useGameStore((s) => s.defeatedMonsterIds);
  const resources = useGameStore((s) => s.resources);
  const roomBlocks = useGameStore((s) => s.roomBlocks);

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
  const buildMaterials = useMemo(
    () => resources.wood + resources.stone,
    [resources.wood, resources.stone],
  );
  const placedCount = Object.keys(roomBlocks).length;
  const showSettleNudge = buildMaterials > 0;

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

      {showSettleNudge ? (
        <section className="mw-card border-[var(--primary)]/40 bg-primary/10 p-5">
          <h2 className="text-lg font-black text-primary">
            回基地建房 Build your home
          </h2>
          <p className="mt-1 text-sm font-semibold text-muted">
            已有木头/石头 ×{buildMaterials}
            {placedCount > 0 ? ` · 房间已放 ${placedCount} 块` : " · 房间还空着"}
            <span className="mt-0.5 block text-xs">
              Wood/stone ready — place planks & cobble in your side-view room
            </span>
          </p>
          <Link href="/" className="mw-btn mw-btn-secondary mt-4 inline-flex">
            回基地放置方块 → Place blocks
          </Link>
        </section>
      ) : null}

      {!hasAny ? (
        <section className="mw-card p-8 text-center">
          <p className="text-4xl">✨</p>
          <p className="mt-4 text-lg font-bold">
            {buildMaterials > 0
              ? "怪物清完了 — 回基地用材料建房吧！"
              : "目前没有怪物，去背包看看材料吧！"}
          </p>
          <p className="mt-2 text-sm font-semibold text-muted">
            {buildMaterials > 0
              ? "No monsters left — settle in and build your room."
              : "No monsters left — check your inventory for crafting materials."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="mw-btn mw-btn-primary inline-flex">
              基地 Home →
            </Link>
            <Link href="/inventory" className="mw-btn mw-btn-outline inline-flex">
              背包 Inventory →
            </Link>
            <Link href="/crafting" className="mw-btn mw-btn-secondary inline-flex">
              合成 Crafting →
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
