"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { GameIcon } from "@/components/GameIcon";
import { countCompletedVillagerChatTurns } from "@/data/villagerChat";
import {
  getGoalResourceProgress,
  getWeaponGoalSnapshot,
} from "@/lib/weaponGoal";
import { useGameStore } from "@/store/useGameStore";

type WeaponGoalStripProps = {
  /** Compact strip for hub chrome; fuller card for settle screens. */
  variant?: "hub" | "settle";
  className?: string;
  /** Hide the primary CTA button (caller renders its own). */
  hideCta?: boolean;
};

export function WeaponGoalStrip({
  variant = "hub",
  className = "",
  hideCta = false,
}: WeaponGoalStripProps) {
  const unlockedIds = useGameStore((s) => s.unlockedIds);
  const resources = useGameStore((s) => s.resources);
  const roomBlocks = useGameStore((s) => s.roomBlocks);
  const learnedWordIds = useGameStore((s) => s.learnedWordIds);
  const masteredWordIds = useGameStore((s) => s.masteredWordIds);
  const defeatedMonsterIds = useGameStore((s) => s.defeatedMonsterIds);
  const [villagerChatTurnsDone, setVillagerChatTurnsDone] = useState(0);

  useEffect(() => {
    setVillagerChatTurnsDone(countCompletedVillagerChatTurns());
  }, []);

  const snapshot = getWeaponGoalSnapshot(
    unlockedIds,
    resources,
    roomBlocks,
    {
      learnedWordIds,
      masteredWordIds,
      unlockedIds,
      defeatedMonsterIds,
      villagerChatTurnsDone,
    },
  );
  const goal = snapshot.goal;
  const resourceProgress =
    goal && snapshot.status !== "line-complete"
      ? getGoalResourceProgress(goal, resources)
      : null;
  const homeProgress =
    snapshot.status === "line-complete" &&
    snapshot.homeFill &&
    snapshot.homeFill.empty > 0
      ? snapshot.homeFill
      : null;
  const weeklyProgress =
    snapshot.status === "line-complete" &&
    snapshot.weekly &&
    (snapshot.homeFill?.empty ?? 0) === 0
      ? snapshot.weekly
      : null;
  const barHave =
    resourceProgress?.have ??
    homeProgress?.filled ??
    weeklyProgress?.have ??
    0;
  const barNeed =
    resourceProgress?.need ??
    homeProgress?.total ??
    weeklyProgress?.need ??
    0;
  const barLabel = resourceProgress
    ? `${resourceProgress.resource} ${resourceProgress.have}/${resourceProgress.need}`
    : homeProgress
      ? `home ${homeProgress.filled}/${homeProgress.total}`
      : weeklyProgress
        ? `weekly ${weeklyProgress.have}/${weeklyProgress.need}`
        : null;

  if (variant === "hub") {
    return (
      <div
        className={`mw-weapon-goal-strip mw-weapon-goal-strip-hub ${className}`}
        role="status"
      >
        <div className="mw-weapon-goal-strip-main">
          {goal ? (
            <GameIcon src={goal.icon} alt="" size="xs" className="shrink-0" />
          ) : null}
          <div className="min-w-0">
            <p className="mw-weapon-goal-strip-cn truncate">{snapshot.stripCn}</p>
            <p className="mw-weapon-goal-strip-en truncate">{snapshot.stripEn}</p>
          </div>
        </div>
        {barLabel && barNeed > 0 ? (
          <div className="mw-weapon-goal-bar" aria-label={barLabel}>
            <span
              className="mw-weapon-goal-bar-fill"
              style={{
                width: `${Math.round((barHave / barNeed) * 100)}%`,
              }}
            />
          </div>
        ) : null}
        {!hideCta ? (
          <Link
            href={snapshot.primaryCta.href}
            className={`mw-weapon-goal-cta ${
              snapshot.primaryCta.kind === "craft"
                ? "mw-weapon-goal-cta-craft"
                : snapshot.primaryCta.kind === "trade"
                  ? "mw-weapon-goal-cta-trade"
                  : snapshot.primaryCta.kind === "home"
                    ? "mw-weapon-goal-cta-home"
                    : ""
            }`}
          >
            {snapshot.primaryCta.labelCn}
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <section
      className={`mw-weapon-goal-strip mw-weapon-goal-strip-settle ${className}`}
    >
      <p className="text-xs font-black uppercase tracking-wide text-primary">
        当前目标 Goal
      </p>
      <p className="mt-1 text-lg font-black">{snapshot.stripCn}</p>
      <p className="text-sm font-semibold text-muted">{snapshot.stripEn}</p>
      {resourceProgress ? (
        <p className="mt-2 text-sm font-bold">
          {resourceProgress.resource} {resourceProgress.have}/
          {resourceProgress.need}
        </p>
      ) : null}
      {homeProgress ? (
        <p className="mt-2 text-sm font-bold">
          家装位 {homeProgress.filled}/{homeProgress.total}
        </p>
      ) : null}
      {weeklyProgress ? (
        <p className="mt-2 text-sm font-bold">
          本周挑战 {weeklyProgress.have}/{weeklyProgress.need}
          {weeklyProgress.done ? " · 完成" : ""}
        </p>
      ) : null}
      {barLabel && barNeed > 0 ? (
        <div className="mw-weapon-goal-bar mt-2">
          <span
            className="mw-weapon-goal-bar-fill"
            style={{
              width: `${Math.round((barHave / barNeed) * 100)}%`,
            }}
          />
        </div>
      ) : null}
      <p className="mt-3 text-xs font-semibold text-muted">
        {snapshot.nextPreviewCn}
        <span className="mt-0.5 block">{snapshot.nextPreviewEn}</span>
      </p>
      {!hideCta ? (
        <Link
          href={snapshot.primaryCta.href}
          className="mw-btn mw-btn-primary mt-4 w-full"
        >
          {snapshot.primaryCta.labelCn}{" "}
          <span className="opacity-80">{snapshot.primaryCta.labelEn}</span>
        </Link>
      ) : null}
    </section>
  );
}
