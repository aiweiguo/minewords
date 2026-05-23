"use client";

import Link from "next/link";
import { useMemo } from "react";

import { GameIcon } from "@/components/GameIcon";
import { formatDailyRewards, getDailyAdventure, getTodayDateString } from "@/lib/dailyAdventure";
import { canClaimDailyAdventure } from "@/lib/dailyAdventureClaim";
import { getVocabularyIcon } from "@/lib/assets";
import { getVocabularyById } from "@/data/vocabulary";
import { useGameStore } from "@/store/useGameStore";

export function DailyAdventurePanel() {
  const dailyStats = useGameStore((s) => s.dailyStats);
  const completedQuestIds = useGameStore((s) => s.completedQuestIds);
  const completedGuideIds = useGameStore((s) => s.completedGuideIds);
  const completeDailyAdventure = useGameStore((s) => s.completeDailyAdventure);

  const today = getTodayDateString();
  const adventure = getDailyAdventure(today);
  const claimCheck = useMemo(
    () => canClaimDailyAdventure(adventure, completedQuestIds, completedGuideIds),
    [adventure, completedQuestIds, completedGuideIds],
  );

  const completed =
    dailyStats.date === today &&
    dailyStats.dailyAdventureCompleted &&
    dailyStats.dailyAdventureId === adventure.id;

  function handleComplete() {
    if (!claimCheck.ok || completed) return;
    completeDailyAdventure(adventure);
  }

  return (
    <section className="mw-card mw-reward-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-secondary">
            Today&apos;s Adventure
          </p>
          <h2 className="mt-1 text-2xl font-black text-primary">今日冒险</h2>
        </div>
        <span className="text-3xl">🗺️</span>
      </div>

      <h3 className="mt-4 text-xl font-black">{adventure.title}</h3>
      <p className="font-bold text-secondary">{adventure.titleCn}</p>
      <p className="mt-2 text-sm font-semibold text-muted">{adventure.descriptionCn}</p>

      <div className="mt-4">
        <p className="text-sm font-black">今日单词</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {adventure.wordIds.map((wordId) => {
            const word = getVocabularyById(wordId);
            if (!word) return null;
            return (
              <Link
                key={wordId}
                href={`/dictionary/${wordId}`}
                className="inline-flex items-center gap-2 rounded-full bg-black/20 px-3 py-1 text-sm font-bold"
              >
                <GameIcon src={getVocabularyIcon(wordId)} alt={word.english} size="xs" />
                {word.english}
              </Link>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold">
        奖励：{formatDailyRewards(adventure.rewards)}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {adventure.guideId ? (
          <Link href={`/guides/${adventure.guideId}`} className="mw-btn mw-btn-outline text-sm">
            看攻略 + 小测验
          </Link>
        ) : null}
        {adventure.questId ? (
          <Link href={`/quests/${adventure.questId}`} className="mw-btn mw-btn-outline text-sm">
            做任务
          </Link>
        ) : null}
        {!completed ? (
          <button
            type="button"
            disabled={!claimCheck.ok}
            onClick={handleComplete}
            className="mw-btn mw-btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            领取今日冒险奖励
          </button>
        ) : (
          <span className="rounded-xl bg-green-900/40 px-4 py-2 text-sm font-bold text-green-200">
            ✓ 今日冒险已完成
          </span>
        )}
      </div>

      {!completed && !claimCheck.ok ? (
        <p className="mt-3 text-sm font-semibold text-amber-200">{claimCheck.reason}</p>
      ) : null}
    </section>
  );
}
