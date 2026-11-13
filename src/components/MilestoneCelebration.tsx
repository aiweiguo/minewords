"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { GameIcon } from "@/components/GameIcon";
import { countCompletedVillagerChatTurns } from "@/data/villagerChat";
import { assetMap } from "@/lib/assets";
import {
  getMilestoneCelebrationCopy,
  getPendingMilestoneCelebration,
} from "@/lib/milestoneCelebration";
import { getHomeFillProgress } from "@/lib/weaponGoal";
import { useGameStore } from "@/store/useGameStore";

function useGameStoreHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => useGameStore.persist.onFinishHydration(onStoreChange),
    () => useGameStore.persist.hasHydrated(),
    () => false,
  );
}

/**
 * MW-60 / P2-2: short once-per-milestone full-screen celebration when the
 * diamond sword hangs and/or home slots fill, then CTA into the existing
 * home-decorate / weekly-challenge goal path (MW-55).
 */
export function MilestoneCelebration() {
  const hydrated = useGameStoreHydrated();
  const unlockedIds = useGameStore((s) => s.unlockedIds);
  const resources = useGameStore((s) => s.resources);
  const roomBlocks = useGameStore((s) => s.roomBlocks);
  const learnedWordIds = useGameStore((s) => s.learnedWordIds);
  const masteredWordIds = useGameStore((s) => s.masteredWordIds);
  const defeatedMonsterIds = useGameStore((s) => s.defeatedMonsterIds);
  const seen = useGameStore((s) => s.seenMilestoneCelebrations);
  const hasSeenOnboarding = useGameStore((s) => s.hasSeenOnboarding);
  const markMilestoneCelebrationSeen = useGameStore(
    (s) => s.markMilestoneCelebrationSeen,
  );

  if (!hydrated || !hasSeenOnboarding) {
    return null;
  }

  const active = getPendingMilestoneCelebration(
    unlockedIds,
    roomBlocks,
    seen,
  );
  if (!active) {
    return null;
  }

  const villagerChatTurnsDone = countCompletedVillagerChatTurns();
  const copy = getMilestoneCelebrationCopy(
    active,
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

  const iconSrc =
    active === "diamondLine" ? assetMap.sword : assetMap.chest;

  const kind = active;

  function dismiss() {
    markMilestoneCelebrationSeen(kind);
    // Legacy / import saves may already have a full home when diamond first
    // celebrates — one moment that hands off to weekly, not two overlays.
    if (
      kind === "diamondLine" &&
      getHomeFillProgress(roomBlocks).empty === 0
    ) {
      markMilestoneCelebrationSeen("homeFull");
    }
  }

  return (
    <div
      className="mw-milestone-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mw-milestone-title"
    >
      <div className="mw-milestone-panel mw-game-panel">
        <div className="mw-milestone-hero" aria-hidden>
          <GameIcon
            src={iconSrc}
            alt=""
            size="xl"
            className="mw-milestone-icon"
          />
          <span className="mw-milestone-spark mw-milestone-spark-a" />
          <span className="mw-milestone-spark mw-milestone-spark-b" />
          <span className="mw-milestone-spark mw-milestone-spark-c" />
        </div>

        <p className="mw-milestone-brand">MineWords</p>
        <h2 id="mw-milestone-title" className="mw-milestone-title">
          {copy.titleCn}
        </h2>
        <p className="mw-milestone-title-en">{copy.titleEn}</p>
        <p className="mw-milestone-lead">{copy.leadCn}</p>
        <p className="mw-milestone-lead-en">{copy.leadEn}</p>

        <div className="mw-milestone-actions">
          <Link
            href={copy.ctaHref}
            className="mw-btn mw-btn-primary mw-milestone-cta w-full"
            onClick={dismiss}
          >
            {copy.ctaLabelCn}{" "}
            <span className="opacity-80">{copy.ctaLabelEn}</span>
          </Link>
          <button
            type="button"
            className="mw-btn mw-btn-outline w-full"
            onClick={dismiss}
          >
            先看看基地 Stay home
          </button>
        </div>
      </div>
    </div>
  );
}
