"use client";

import Link from "next/link";

import { GameIcon } from "@/components/GameIcon";
import { RarityBadge } from "@/components/RarityBadge";
import { getUnlockableById } from "@/data/unlockables";
import { assetMap, getResourceIcon } from "@/lib/assets";
import { getWeaponGoalSnapshot } from "@/lib/weaponGoal";
import { useGameStore } from "@/store/useGameStore";
import { Reward } from "@/types";

type RewardModalProps = {
  open: boolean;
  rewards: Reward[];
  unlocks: string[];
  isFirstCompletion: boolean;
  onClose: () => void;
  /** Soft nudge toward building when fight drops materials. */
  settleHref?: string;
};

export function RewardModal({
  open,
  rewards,
  unlocks,
  isFirstCompletion,
  onClose,
  settleHref = "/",
}: RewardModalProps) {
  const unlockedIds = useGameStore((s) => s.unlockedIds);
  const resources = useGameStore((s) => s.resources);

  if (!open) return null;

  const goal = getWeaponGoalSnapshot(unlockedIds, resources);
  const hasLoot = rewards.length > 0 || unlocks.length > 0;
  const showWeaponSettle = hasLoot || isFirstCompletion;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="mw-reward-glow mw-game-panel w-full max-w-md rounded-lg p-6">
        <div className="text-center">
          <GameIcon src={assetMap.star} alt="Quest complete" size="xl" className="mx-auto" />
          <h2 className="mt-3 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-3xl font-black text-transparent">
            {rewards.length > 0 || unlocks.length > 0
              ? "Loot Drop!"
              : isFirstCompletion
                ? "Quest Complete!"
                : "Practice Complete!"}
          </h2>
          <p className="mt-1 text-lg font-black text-primary">
            {rewards.length > 0 || unlocks.length > 0
              ? "打到材料了！"
              : isFirstCompletion
                ? "任务完成！"
                : "练习完成！"}
          </p>
        </div>

        <p className="mt-4 text-center text-sm font-bold text-muted">
          {rewards.length > 0 || unlocks.length > 0
            ? "你获得了："
            : "这次没有额外掉落，但继续加油！"}
        </p>

        {rewards.length > 0 || unlocks.length > 0 ? (
          <div className="mt-4 space-y-3">
            {rewards.map((reward, index) => {
              if (reward.type === "resource" && reward.resource) {
                return (
                  <div
                    key={`${reward.resource}-${index}`}
                    className="flex items-center gap-3 rounded-lg border border-[var(--panel-border)] bg-black/25 px-4 py-3 font-bold"
                  >
                    <GameIcon
                      src={getResourceIcon(reward.resource)}
                      alt={reward.resource}
                      size="md"
                    />
                    <span className="capitalize">
                      {reward.resource} x{reward.amount}
                    </span>
                  </div>
                );
              }

              if (reward.type === "xp") {
                return (
                  <div
                    key={`xp-${index}`}
                    className="flex items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-900/20 px-4 py-3 font-bold text-amber-200"
                  >
                    <GameIcon src={assetMap.star} alt="XP" size="md" />
                    <span>XP +{reward.xp}</span>
                  </div>
                );
              }

              return null;
            })}

            {unlocks.map((unlockId) => {
              const unlock = getUnlockableById(unlockId);
              if (!unlock) return null;
              return (
                <div
                  key={unlockId}
                  className="flex items-center gap-3 rounded-lg border border-cyan-500/30 bg-cyan-900/20 px-4 py-3 font-bold text-cyan-100"
                >
                  <GameIcon
                    src={unlock.image ?? unlock.icon}
                    alt={unlock.name}
                    size="md"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p>{unlock.name}</p>
                      {unlock.rarity ? <RarityBadge rarity={unlock.rarity} compact /> : null}
                    </div>
                    <p className="text-sm font-semibold text-cyan-200/80">{unlock.nameCn}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {showWeaponSettle ? (
          <div className="mt-5 rounded-lg border border-[var(--panel-border)] bg-black/20 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-primary">
              当前目标 Goal
            </p>
            <p className="mt-1 text-base font-black">{goal.stripCn}</p>
            <p className="text-xs font-semibold text-muted">{goal.stripEn}</p>
            <p className="mt-2 text-[11px] font-semibold text-muted">
              {goal.nextPreviewCn}
            </p>
          </div>
        ) : null}

        <div className="mt-6 space-y-2">
          {showWeaponSettle ? (
            <>
              <Link
                href={goal.primaryCta.href}
                onClick={onClose}
                className={`mw-btn w-full ${
                  goal.primaryCta.kind === "craft"
                    ? "mw-btn-secondary"
                    : "mw-btn-primary"
                }`}
              >
                {goal.primaryCta.labelCn}{" "}
                <span className="opacity-80">{goal.primaryCta.labelEn}</span>
              </Link>
              <Link
                href={settleHref}
                onClick={onClose}
                className="mw-btn mw-btn-outline w-full"
              >
                回基地 Home
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="mw-btn mw-btn-primary w-full"
            >
              继续 Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
