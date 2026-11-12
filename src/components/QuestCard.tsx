import Link from "next/link";

import { GameIcon } from "@/components/GameIcon";
import { mapAreaLabels } from "@/data/quests";
import {
  ErrandProgressView,
  formatRewardPreview,
  getErrandProgress,
} from "@/lib/questEngine";
import { assetMap, getMapAreaBackground } from "@/lib/assets";
import { Quest, QuestStatus, ResourceType } from "@/types";

type QuestCardProps = {
  quest: Quest;
  status: QuestStatus;
  errandProgress?: Record<string, number>;
  resources?: Record<ResourceType, number>;
  unlockedIds?: string[];
  completedQuestIds?: string[];
};

function renderDifficulty(difficulty: number) {
  return "★".repeat(difficulty) + "☆".repeat(3 - difficulty);
}

function statusLabel(status: QuestStatus, progress: ErrandProgressView | null) {
  if (status === "completed") {
    return { text: "已完成", className: "bg-green-900/60 text-green-200 border-green-500" };
  }
  if (status === "locked") {
    return { text: "未解锁", className: "bg-gray-900/60 text-gray-300 border-gray-500" };
  }
  if (progress?.readyToClaim) {
    return { text: "可领取", className: "bg-amber-900/60 text-amber-100 border-amber-500" };
  }
  return { text: "进行中", className: "bg-blue-900/60 text-blue-200 border-blue-500" };
}

function getRewardIcons(quest: Quest): string[] {
  return quest.rewards
    .map((reward) => {
      if (reward.type === "resource" && reward.resource) {
        return `/assets/icons/resources/${reward.resource === "gold" ? "emerald" : reward.resource}.svg`;
      }
      if (reward.type === "xp") {
        return assetMap.star;
      }
      return null;
    })
    .filter((icon): icon is string => Boolean(icon));
}

export function QuestCard({
  quest,
  status,
  errandProgress = {},
  resources,
  unlockedIds = [],
  completedQuestIds = [],
}: QuestCardProps) {
  const progress = getErrandProgress(quest, {
    errandProgress,
    resources: resources ?? {
      wood: 0,
      stone: 0,
      iron: 0,
      gold: 0,
      emerald: 0,
      diamond: 0,
      netherite: 0,
    },
    unlockedIds,
    completedQuestIds,
  });
  const badge = statusLabel(status, progress);
  const disabled = status === "locked";
  const areaLabel = mapAreaLabels[quest.mapArea];
  const coverImage = quest.coverImage ?? getMapAreaBackground(quest.mapArea);
  const questIcon = quest.icon ?? assetMap.star;
  const rewardIcons = getRewardIcons(quest);
  const summary = quest.descriptionCn ?? quest.description;
  const pct =
    progress && progress.target > 0
      ? Math.round((progress.current / progress.target) * 100)
      : 0;

  const content = (
    <article
      className={`mw-card overflow-hidden ${disabled ? "opacity-70" : "transition-transform hover:-translate-y-0.5"}`}
      style={{ borderColor: quest.themeColor ?? undefined }}
    >
      <div
        className="mw-quest-cover relative h-24 bg-black/30"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.65)), url(${coverImage})`,
        }}
      >
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <GameIcon src={questIcon} alt={quest.title} size="sm" />
          <span className="rounded-md border border-white/20 bg-black/50 px-2 py-1 text-xs font-black text-white">
            {areaLabel?.cn ?? quest.mapArea}
          </span>
        </div>
        <span
          className={`absolute right-3 top-3 rounded-md border px-2 py-1 text-xs font-black ${badge.className}`}
        >
          {badge.text}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-black">{quest.titleCn}</h3>
            <p className="mt-1 text-sm font-bold text-secondary">{quest.title}</p>
          </div>
          {disabled ? <GameIcon src={assetMap.lock} alt="Locked" size="xs" /> : null}
        </div>

        <p className="mt-3 text-sm text-muted">{summary}</p>

        {progress && status !== "locked" ? (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs font-bold">
              <span>{progress.labelCn}</span>
              <span>
                {progress.current}/{progress.target}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-4 space-y-2 text-sm font-semibold">
          <p>难度：{renderDifficulty(quest.difficulty)}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span>奖励：</span>
            {rewardIcons.map((icon, index) => (
              <GameIcon key={`${quest.id}-reward-${index}`} src={icon} alt="reward" size="xs" />
            ))}
            <span className="text-muted">{formatRewardPreview(quest)}</span>
          </div>
        </div>

        {!disabled ? (
          <p className="mt-4 text-sm font-bold text-primary">
            {status === "completed"
              ? "查看委托 →"
              : progress?.readyToClaim
                ? "领取材料 →"
                : `${progress?.actionLabelCn ?? "打开委托"} →`}
          </p>
        ) : null}
      </div>
    </article>
  );

  if (disabled) {
    return content;
  }

  return <Link href={`/quests/${quest.id}`}>{content}</Link>;
}
