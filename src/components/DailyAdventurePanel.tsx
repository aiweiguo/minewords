"use client";

import Link from "next/link";
import { useMemo } from "react";

import { GameIcon } from "@/components/GameIcon";
import {
  formatDailyRewards,
  getDailyAdventure,
  getDailyAdventurePlayHref,
  getDailyAdventurePlayLabel,
  getTodayDateString,
} from "@/lib/dailyAdventure";
import { canClaimDailyAdventure } from "@/lib/dailyAdventureClaim";
import { getVocabularyIcon } from "@/lib/assets";
import { getVocabularyById } from "@/data/vocabulary";
import { useGameStore } from "@/store/useGameStore";

type DailyAdventurePanelProps = {
  /** Compact one-job strip for hub; fuller card elsewhere. */
  variant?: "full" | "hub";
};

export function DailyAdventurePanel({ variant = "full" }: DailyAdventurePanelProps) {
  const dailyStats = useGameStore((s) => s.dailyStats);
  const learningStreak = useGameStore((s) => s.learningStreak);
  const unlockedIds = useGameStore((s) => s.unlockedIds);
  const completeDailyAdventure = useGameStore((s) => s.completeDailyAdventure);

  const today = getTodayDateString();
  const adventure = useMemo(
    () => getDailyAdventure(today, unlockedIds),
    [today, unlockedIds],
  );
  const claimCheck = useMemo(
    () => canClaimDailyAdventure(adventure, dailyStats.speakLoop),
    [adventure, dailyStats.speakLoop],
  );

  const completed =
    dailyStats.date === today &&
    dailyStats.dailyAdventureCompleted &&
    dailyStats.dailyAdventureId === adventure.id;

  function handleComplete() {
    if (!claimCheck.ok || completed) return;
    completeDailyAdventure(adventure);
  }

  const playHref = getDailyAdventurePlayHref(adventure);
  const playLabel = getDailyAdventurePlayLabel(adventure);

  if (variant === "hub") {
    return (
      <section
        className="mw-hub-daily"
        aria-label="今日冒险"
        data-daily-id={adventure.id}
        data-daily-action={adventure.actionKind}
      >
        <div className="mw-hub-daily-main">
          {learningStreak > 0 ? (
            <span
              className="mw-hub-daily-streak"
              title={`连续学习 ${learningStreak} 天`}
              aria-label={`连续学习 ${learningStreak} 天`}
            >
              <span aria-hidden>🔥</span>
              {learningStreak}
            </span>
          ) : null}
          <div className="mw-hub-daily-copy min-w-0">
            <p className="mw-hub-daily-kicker">今日冒险</p>
            <p className="mw-hub-daily-title truncate">{adventure.titleCn}</p>
            {!completed ? (
              <p className="mw-hub-daily-progress truncate text-xs opacity-80">
                {claimCheck.progress}/{claimCheck.needed} · {playLabel}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mw-hub-daily-actions">
          {completed ? (
            <span className="mw-hub-daily-done">✓ 已完成</span>
          ) : claimCheck.ok ? (
            <button
              type="button"
              onClick={handleComplete}
              className="mw-hub-daily-cta mw-hub-daily-cta-claim"
            >
              领取奖励
            </button>
          ) : (
            <Link href={playHref} className="mw-hub-daily-cta">
              {playLabel}
            </Link>
          )}
        </div>
      </section>
    );
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
      <p className="mt-1 text-sm font-semibold text-muted">
        开口进度：{claimCheck.progress}/{claimCheck.needed}（{playLabel}）
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={playHref} className="mw-btn mw-btn-secondary text-sm">
          {playLabel}
        </Link>
        {adventure.guideId ? (
          <Link href={`/guides/${adventure.guideId}`} className="mw-btn mw-btn-outline text-sm">
            家长旁路：攻略
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
