"use client";

import Link from "next/link";
import { useState } from "react";

import { useGameStore } from "@/store/useGameStore";
import { getErrandProgress } from "@/lib/questEngine";
import { getWeaponGoalSnapshot } from "@/lib/weaponGoal";
import { Quest } from "@/types";

type QuestRunnerProps = {
  quest: Quest;
  practiceMode: boolean;
  onComplete: (isFirstCompletion: boolean) => void;
};

/**
 * Material errand runner (MW-8).
 * No quiz steps — show clear progress and nudge back to explore / craft.
 */
export function QuestRunner({ quest, practiceMode, onComplete }: QuestRunnerProps) {
  const completeQuest = useGameStore((state) => state.completeQuest);
  const errandProgress = useGameStore((state) => state.errandProgress);
  const resources = useGameStore((state) => state.resources);
  const unlockedIds = useGameStore((state) => state.unlockedIds);
  const roomBlocks = useGameStore((state) => state.roomBlocks);
  const completedQuestIds = useGameStore((state) => state.completedQuestIds);
  const [claimError, setClaimError] = useState<string | null>(null);

  const progress = getErrandProgress(quest, {
    errandProgress,
    resources,
    unlockedIds,
    completedQuestIds,
  });
  const goal = getWeaponGoalSnapshot(unlockedIds, resources, roomBlocks);
  const completed = completedQuestIds.includes(quest.id);
  const pct =
    progress && progress.target > 0
      ? Math.round((progress.current / progress.target) * 100)
      : 0;

  function handleClaim() {
    if (practiceMode || completed) {
      onComplete(false);
      return;
    }
    const result = completeQuest(quest.id);
    if (!result) {
      setClaimError("进度还没满，先去打怪或攒材料。");
      return;
    }
    setClaimError(null);
    onComplete(result.isFirstCompletion);
  }

  if (!quest.errand || !progress) {
    return (
      <section className="mw-card p-6">
        <p className="font-bold text-muted">这个委托暂时不可用。</p>
        <Link href="/explore" className="mw-btn mw-btn-primary mt-4">
          去打怪 Explore
        </Link>
      </section>
    );
  }

  const tradeHref = quest.errand.tradeOfferId
    ? `/trade?offer=${quest.errand.tradeOfferId}`
    : "/trade";
  const postClaimHref =
    quest.errand.nudge === "trade"
      ? tradeHref
      : quest.errand.nudge === "craft" || goal.canCraft
        ? `/crafting/${quest.errand.weaponId}`
        : "/explore";
  const postClaimLabel =
    quest.errand.nudge === "trade"
      ? "去交易买钻石"
      : quest.errand.nudge === "craft" || goal.canCraft
        ? "去合成武器"
        : "继续打怪凑材料";

  return (
    <section className="mw-card space-y-5 p-6">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-primary">
          材料委托 Errand
        </p>
        <h2 className="mt-1 text-2xl font-black">{quest.titleCn}</h2>
        <p className="text-sm font-semibold text-muted">
          {quest.descriptionCn ?? quest.description}
        </p>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-sm font-bold">
          <span>{progress.labelCn}</span>
          <span>
            {progress.current}/{progress.target}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-semibold text-muted">{progress.labelEn}</p>
      </div>

      <div className="rounded-lg border border-[var(--panel-border)] bg-black/20 px-4 py-3">
        <p className="text-xs font-black uppercase tracking-wide text-primary">
          当前武器目标
        </p>
        <p className="mt-1 text-base font-black">{goal.stripCn}</p>
        <p className="text-xs font-semibold text-muted">{goal.stripEn}</p>
      </div>

      {completed ? (
        <div className="space-y-3">
          <p className="rounded-xl bg-green-900/30 px-4 py-3 text-sm font-bold text-green-100">
            委托完成！材料已进背包 — 接着合成或继续探索。
          </p>
          <Link href={postClaimHref} className="mw-btn mw-btn-primary w-full">
            {postClaimLabel}
          </Link>
          <Link href="/explore" className="mw-btn mw-btn-outline w-full">
            出门探索 Explore
          </Link>
        </div>
      ) : progress.readyToClaim ? (
        <div className="space-y-3">
          <button type="button" className="mw-btn mw-btn-primary w-full" onClick={handleClaim}>
            领取材料奖励 Claim
          </button>
          <p className="text-center text-xs font-semibold text-muted">
            领取后会带你回到合成 / 探索，不是下一张测验卷。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <Link href={progress.actionHref} className="mw-btn mw-btn-primary w-full">
            {progress.actionLabelCn}{" "}
            <span className="opacity-80">{progress.actionLabelEn}</span>
          </Link>
          {quest.errand.nudge === "craft" ? (
            <Link
              href={`/crafting/${quest.errand.weaponId}`}
              className="mw-btn mw-btn-outline w-full"
            >
              看看配方 Craft
            </Link>
          ) : quest.errand.nudge === "trade" ? (
            <Link href={tradeHref} className="mw-btn mw-btn-outline w-full">
              去交易 Trade
            </Link>
          ) : (
            <Link href="/" className="mw-btn mw-btn-outline w-full">
              回基地 Home
            </Link>
          )}
        </div>
      )}

      {claimError ? (
        <p className="text-sm font-semibold text-amber-200">{claimError}</p>
      ) : null}
    </section>
  );
}
