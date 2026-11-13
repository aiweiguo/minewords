"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { WeaponGoalStrip } from "@/components/WeaponGoalStrip";
import { WordMonsterCard } from "@/components/WordMonsterCard";
import { WILD_MONSTER_WORD_IDS } from "@/data/monsterDrops";
import { getExploreZoneById } from "@/data/exploreZones";
import { getVocabularyById } from "@/data/vocabulary";
import {
  getWildMonsterIdsForZone,
  resolveSelectedExploreZoneId,
} from "@/lib/exploreZones";
import { getWeaponGoalSnapshot } from "@/lib/weaponGoal";
import { MONSTER_WRONG_THRESHOLD } from "@/lib/wrongWord";
import { useGameStore } from "@/store/useGameStore";

export default function FightPage() {
  const wrongWordCounts = useGameStore((s) => s.wrongWordCounts);
  const defeatedMonsterIds = useGameStore((s) => s.defeatedMonsterIds);
  const resources = useGameStore((s) => s.resources);
  const unlockedIds = useGameStore((s) => s.unlockedIds);
  const selectedExploreZoneId = useGameStore((s) => s.selectedExploreZoneId);
  const setSelectedExploreZone = useGameStore((s) => s.setSelectedExploreZone);
  const [entered, setEntered] = useState(false);

  const zoneId = resolveSelectedExploreZoneId(
    selectedExploreZoneId,
    unlockedIds,
  );
  const zone = getExploreZoneById(zoneId);
  const zoneWildIds = getWildMonsterIdsForZone(zoneId);

  useEffect(() => {
    if (selectedExploreZoneId !== zoneId) {
      setSelectedExploreZone(zoneId);
    }
  }, [selectedExploreZoneId, setSelectedExploreZone, zoneId]);

  useEffect(() => {
    // MW-68: short land-in beat after explore enter transition.
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setEntered(true);
      return;
    }
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  // Zone wilds stay fightable (farmable) so craft goals keep getting materials.
  const wildMonsters = [...zoneWildIds];

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
  const roomBlocks = useGameStore((s) => s.roomBlocks);
  const learnedWordIds = useGameStore((s) => s.learnedWordIds);
  const masteredWordIds = useGameStore((s) => s.masteredWordIds);
  const goal = getWeaponGoalSnapshot(unlockedIds, resources, roomBlocks, {
    learnedWordIds,
    masteredWordIds,
    unlockedIds,
    defeatedMonsterIds,
  });

  return (
    <main
      className={`mw-fight-page space-y-5${entered ? " mw-fight-page-entered" : ""}`}
    >
      <section
        className={`mw-explore-fight-banner mw-explore-fight-banner-${zone?.tone ?? "forest"} mw-game-panel overflow-hidden`}
        style={
          zone
            ? {
                backgroundImage: `url(${zone.background})`,
              }
            : undefined
        }
      >
        <div className="flex flex-wrap items-end justify-between gap-3 p-4 sm:p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-primary">
              遭遇 Encounter
            </p>
            <h1 className="text-2xl font-black sm:text-3xl">
              {zone?.nameCn ?? "探索"}{" "}
              <span className="text-lg font-bold text-secondary">
                {zone?.name}
              </span>
            </h1>
            <p className="mt-1 text-sm font-semibold text-muted">
              掉落偏 {zone?.focusLabelCn ?? "材料"} · 开口打怪喂武器目标
            </p>
          </div>
          <Link href="/explore" className="mw-btn mw-btn-outline text-sm">
            换区域 →
          </Link>
        </div>
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
        <section className="mw-fight-encounters space-y-4">
          <h2 className="px-1 text-lg font-black">
            {zone?.nameCn ?? "野外"}怪物 Wild Monsters
          </h2>
          <p className="px-1 text-sm font-semibold text-muted">
            可反复开口打怪攒 {zone?.focusLabelCn ?? "材料"}。同一只怪：单词 → 短句 → 整句，说得越完整伤害越大。
          </p>
          {wildMonsters.map((wordId) => (
            <WordMonsterCard
              key={`${zoneId}-${wordId}`}
              wordId={wordId}
              wild
              zoneId={zoneId}
              farmable
            />
          ))}
        </section>
      ) : null}

      {wrongMonsters.length > 0 ? (
        <section className="mw-fight-encounters space-y-4">
          <h2 className="px-1 text-lg font-black">错词怪物 Wrong-Word Monsters</h2>
          <p className="px-1 text-sm font-semibold text-muted">
            同一个词错 {MONSTER_WRONG_THRESHOLD} 次以上会出现。开口打怪：单词伤小，整句打满。
          </p>
          {wrongMonsters.map(([wordId, count]) => (
            <WordMonsterCard
              key={wordId}
              wordId={wordId}
              wrongCount={count}
              zoneId={zoneId}
            />
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
