import Link from "next/link";

import { formatRewardPreview } from "@/lib/questEngine";
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
      return { text: "已完成", className: "bg-green-100 text-green-800" };
    case "locked":
      return { text: "等级不足", className: "bg-gray-100 text-gray-700" };
    default:
      return { text: "未完成", className: "bg-blue-100 text-blue-800" };
  }
}

export function QuestCard({ quest, status }: QuestCardProps) {
  const badge = statusLabel(status);
  const disabled = status === "locked";

  const content = (
    <article
      className={`mw-card p-4 ${disabled ? "opacity-70" : "hover:-translate-y-0.5 transition-transform"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black">{quest.title}</h3>
          <p className="mt-1 text-base font-bold text-secondary">{quest.titleCn}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}>
          {badge.text}
        </span>
      </div>

      <p className="mt-3 text-sm text-muted">{quest.description}</p>

      <div className="mt-4 space-y-2 text-sm font-semibold">
        <p>难度：{renderDifficulty(quest.difficulty)}</p>
        <p>需要等级：Lv {quest.requiredLevel}</p>
        <p>奖励：{formatRewardPreview(quest)}</p>
      </div>

      {!disabled ? (
        <p className="mt-4 text-sm font-bold text-primary">
          {status === "completed" ? "再练一次 →" : "Start Quest 开始任务 →"}
        </p>
      ) : null}
    </article>
  );

  if (disabled) {
    return content;
  }

  return <Link href={`/quests/${quest.id}`}>{content}</Link>;
}
