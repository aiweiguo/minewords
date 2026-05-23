"use client";

import Link from "next/link";

import { displayResources, ResourceBadge } from "@/components/ResourceBadge";
import { StatCard } from "@/components/StatCard";
import { quests } from "@/data/quests";
import { unlockables } from "@/data/unlockables";
import { getQuestStatus } from "@/lib/questEngine";
import { getXpProgress } from "@/lib/progress";
import { useGameStore } from "@/store/useGameStore";

const quickLinks = [
  { href: "/dictionary", label: "词典", icon: "📖" },
  { href: "/quests", label: "任务", icon: "⚔️" },
  { href: "/inventory", label: "背包", icon: "🎒" },
  { href: "/unlocks", label: "解锁", icon: "🔓" },
];

export default function HomePage() {
  const playerName = useGameStore((state) => state.playerName);
  const xp = useGameStore((state) => state.xp);
  const resources = useGameStore((state) => state.resources);
  const completedQuestIds = useGameStore((state) => state.completedQuestIds);
  const unlockedIds = useGameStore((state) => state.unlockedIds);
  const dailyStats = useGameStore((state) => state.dailyStats);
  const resetProgress = useGameStore((state) => state.resetProgress);

  const progress = getXpProgress(xp);

  const recommendedQuests = quests
    .filter(
      (quest) =>
        getQuestStatus(quest, xp, completedQuestIds) === "available",
    )
    .slice(0, 3);

  const unlockedEquipment = unlockables.filter(
    (item) => item.type === "equipment" && unlockedIds.includes(item.id),
  );

  return (
    <main className="space-y-6">
      <StatCard
        playerName={playerName}
        level={progress.level}
        xp={xp}
        currentLevelXp={progress.currentLevelXp}
        xpForNextLevel={progress.xpForNextLevel}
        percent={progress.percent}
      />

      <section className="mw-card p-5">
        <h2 className="text-xl font-black">背包资源</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {displayResources.map((resource) => (
            <ResourceBadge
              key={resource}
              resource={resource}
              amount={resources[resource]}
            />
          ))}
        </div>
      </section>

      <section className="mw-card p-5">
        <h2 className="text-xl font-black">今日任务进度</h2>
        <div className="mt-3 grid gap-2 text-sm font-semibold text-muted">
          <p>已完成任务：{dailyStats.completedQuests}</p>
          <p>答对题数：{dailyStats.correctAnswers}</p>
          <p>学会单词：{dailyStats.learnedWords}</p>
        </div>
        <div className="mt-4 space-y-3">
          {recommendedQuests.length > 0 ? (
            recommendedQuests.map((quest) => (
              <Link
                key={quest.id}
                href={`/quests/${quest.id}`}
                className="block rounded-xl border-2 border-[#d9e2cc] bg-[#f5f7ef] px-4 py-3 font-bold hover:bg-[#eef6e4]"
              >
                {quest.title} / {quest.titleCn}
              </Link>
            ))
          ) : (
            <p className="text-sm font-semibold text-muted">
              今天的推荐任务都完成啦！可以去词典或重复练习。
            </p>
          )}
        </div>
      </section>

      <section className="mw-card p-5">
        <h2 className="text-xl font-black">已解锁装备</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {unlockedEquipment.length > 0 ? (
            unlockedEquipment.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-[#eef6e4] px-4 py-3 font-bold text-primary"
              >
                {item.icon} {item.nameCn}
              </div>
            ))
          ) : (
            <p className="text-sm font-semibold text-muted">完成任务解锁第一件装备吧！</p>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="mw-card flex flex-col items-center justify-center p-4 text-center font-black text-primary"
          >
            <span className="text-3xl">{link.icon}</span>
            <span className="mt-2">{link.label}</span>
          </Link>
        ))}
      </section>

      <div className="text-center">
        <button
          type="button"
          onClick={resetProgress}
          className="text-xs font-semibold text-muted underline"
        >
          Reset Progress 重置进度（测试用）
        </button>
      </div>
    </main>
  );
}
