import Link from "next/link";

import { GameIcon } from "@/components/GameIcon";
import { mapAreaLabels } from "@/data/quests";
import { formatRewardPreview } from "@/lib/questEngine";
import { assetMap, getMapAreaBackground } from "@/lib/assets";
import { Quest, QuestStatus } from "@/types";

type QuestCardProps = {
  quest: Quest;
  status: QuestStatus;
};

function renderDifficulty(difficulty: number) {
  return "★".repeat(difficulty) + "☆".repeat(3 - difficulty);
}

function statusLabel(status: QuestStatus) {
  switch (status) {
    case "completed":
      return { text: "已完成", className: "bg-green-900/60 text-green-200 border-green-500" };
    case "locked":
      return { text: "等级不足", className: "bg-gray-900/60 text-gray-300 border-gray-500" };
    default:
      return { text: "可挑战", className: "bg-blue-900/60 text-blue-200 border-blue-500" };
  }
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

export function QuestCard({ quest, status }: QuestCardProps) {
  const badge = statusLabel(status);
  const disabled = status === "locked";
  const areaLabel = mapAreaLabels[quest.mapArea];
  const coverImage = quest.coverImage ?? getMapAreaBackground(quest.mapArea);
  const questIcon = quest.icon ?? assetMap.star;
  const rewardIcons = getRewardIcons(quest);

  const content = (
    <article
      className={`mw-card overflow-hidden ${disabled ? "opacity-70" : "transition-transform hover:-translate-y-0.5"}`}
      style={{ borderColor: quest.themeColor ?? undefined }}
    >
      <div
        className="mw-quest-cover relative h-28 bg-black/30"
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
            <h3 className="text-xl font-black">{quest.title}</h3>
            <p className="mt-1 text-base font-bold text-secondary">{quest.titleCn}</p>
          </div>
          {disabled ? <GameIcon src={assetMap.lock} alt="Locked" size="xs" /> : null}
        </div>

        <p className="mt-3 text-sm text-muted">{quest.description}</p>

        <div className="mt-4 space-y-2 text-sm font-semibold">
          <p>难度：{renderDifficulty(quest.difficulty)}</p>
          <p>需要等级：Lv {quest.requiredLevel}</p>
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
            {status === "completed" ? "再练一次 →" : "Start Quest 开始任务 →"}
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
