"use client";

import { Reward } from "@/types";
import { getUnlockableById } from "@/data/unlockables";
import { resourceMeta } from "@/components/ResourceBadge";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="mw-card w-full max-w-md p-6">
        <h2 className="text-2xl font-black text-primary">
          {isFirstCompletion ? "Quest Complete! 任务完成！" : "Practice Complete! 练习完成！"}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {isFirstCompletion
            ? "你获得了这些奖励："
            : "这次练习没有额外奖励，但继续加油！"}
        </p>

        {isFirstCompletion ? (
          <div className="mt-4 space-y-3">
            {rewards.map((reward, index) => {
              if (reward.type === "resource" && reward.resource) {
                const meta = resourceMeta[reward.resource];
                return (
                  <div
                    key={`${reward.resource}-${index}`}
                    className="flex items-center gap-3 rounded-xl bg-[#f5f7ef] px-4 py-3 font-bold"
                  >
                    <span className="text-2xl">{meta.emoji}</span>
                    <span>
                      {meta.label} x{reward.amount}
                    </span>
                  </div>
                );
              }

              if (reward.type === "xp") {
                return (
                  <div
                    key={`xp-${index}`}
                    className="flex items-center gap-3 rounded-xl bg-[#eef6e4] px-4 py-3 font-bold text-primary"
                  >
                    <span className="text-2xl">⭐</span>
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
                  className="flex items-center gap-3 rounded-xl bg-[#ecfeff] px-4 py-3 font-bold text-cyan-900"
                >
                  <span className="text-2xl">{unlock.icon}</span>
                  <div>
                    <p>{unlock.name}</p>
                    <p className="text-sm font-semibold">{unlock.nameCn}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <button type="button" onClick={onClose} className="mw-btn mw-btn-primary mt-6 w-full">
          Claim Rewards 领取奖励
        </button>
      </div>
    </div>
  );
}
