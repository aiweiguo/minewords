"use client";

import { GameIcon } from "@/components/GameIcon";
import { RarityBadge } from "@/components/RarityBadge";
import { getUnlockableById } from "@/data/unlockables";
import { assetMap, getResourceIcon } from "@/lib/assets";
import { Reward } from "@/types";

type RewardModalProps = {
  open: boolean;
  rewards: Reward[];
  unlocks: string[];
  isFirstCompletion: boolean;
  onClose: () => void;
};

export function RewardModal({
  open,
  rewards,
  unlocks,
  isFirstCompletion,
  onClose,
}: RewardModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="mw-reward-glow mw-game-panel w-full max-w-md rounded-lg p-6">
        <div className="text-center">
          <GameIcon src={assetMap.star} alt="Quest complete" size="xl" className="mx-auto" />
          <h2 className="mt-3 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-3xl font-black text-transparent">
            {isFirstCompletion ? "Quest Complete!" : "Practice Complete!"}
          </h2>
          <p className="mt-1 text-lg font-black text-primary">
            {isFirstCompletion ? "任务完成！" : "练习完成！"}
          </p>
        </div>

        <p className="mt-4 text-center text-sm font-bold text-muted">
          {isFirstCompletion ? "你获得了：" : "这次练习没有额外奖励，但继续加油！"}
        </p>

        {isFirstCompletion ? (
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

        <button type="button" onClick={onClose} className="mw-btn mw-btn-primary mt-6 w-full">
          {isFirstCompletion ? "继续冒险 Continue" : "继续 Continue"}
        </button>
      </div>
    </div>
  );
}
