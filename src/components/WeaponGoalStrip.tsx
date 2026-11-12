"use client";

import Link from "next/link";

import { GameIcon } from "@/components/GameIcon";
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
  const snapshot = getWeaponGoalSnapshot(unlockedIds, resources);
  const goal = snapshot.goal;
  const progress =
    goal && snapshot.status !== "line-complete"
      ? getGoalResourceProgress(goal, resources)
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
        {progress ? (
          <div
            className="mw-weapon-goal-bar"
            aria-label={`${progress.resource} ${progress.have}/${progress.need}`}
          >
            <span
              className="mw-weapon-goal-bar-fill"
              style={{
                width: `${Math.round((progress.have / progress.need) * 100)}%`,
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
      {progress ? (
        <p className="mt-2 text-sm font-bold">
          {progress.resource} {progress.have}/{progress.need}
        </p>
      ) : null}
      {progress ? (
        <div className="mw-weapon-goal-bar mt-2">
          <span
            className="mw-weapon-goal-bar-fill"
            style={{
              width: `${Math.round((progress.have / progress.need) * 100)}%`,
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
          className={`mw-btn mt-4 w-full ${
            snapshot.primaryCta.kind === "craft"
              ? "mw-btn-secondary"
              : "mw-btn-primary"
          }`}
        >
          {snapshot.primaryCta.labelCn}{" "}
          <span className="opacity-80">{snapshot.primaryCta.labelEn}</span>
        </Link>
      ) : null}
    </section>
  );
}
