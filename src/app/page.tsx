"use client";

import Link from "next/link";

import { BaseDecorationPanel } from "@/components/BaseDecorationPanel";
import { DailyAdventurePanel } from "@/components/DailyAdventurePanel";
import { GameIcon } from "@/components/GameIcon";
import { QuestCard } from "@/components/QuestCard";
import { InventorySlot } from "@/components/InventorySlot";
import { displayResources, ResourceBadge } from "@/components/ResourceBadge";
import { StatCard } from "@/components/StatCard";
import { quests } from "@/data/quests";
import { unlockables } from "@/data/unlockables";
import { assetMap, backgroundMap } from "@/lib/assets";
import { getQuestStatus } from "@/lib/questEngine";
import { getXpProgress } from "@/lib/progress";
import { useGameStore } from "@/store/useGameStore";

const quickLinks = [
  { href: "/map", label: "地图", icon: assetMap.sword },
  { href: "/guides", label: "攻略", icon: assetMap.chest },
  { href: "/crafting", label: "合成", icon: assetMap.axe },
  { href: "/planner", label: "规划", icon: assetMap.pickaxe },
  { href: "/speak", label: "口语", icon: assetMap.star },
  { href: "/review", label: "打怪", icon: assetMap.sword },
  { href: "/create", label: "创意", icon: assetMap.star },
  { href: "/minedex", label: "图鉴", icon: assetMap.chest },
  { href: "/listening", label: "听力", icon: assetMap.star },
  { href: "/quests", label: "任务", icon: assetMap.sword },
  { href: "/inventory", label: "背包", icon: assetMap.chest },
  { href: "/parent", label: "家长", icon: assetMap.lock },
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
      <section
        className="mw-game-panel overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(26,31,22,0.85), rgba(26,31,22,0.95)), url(${backgroundMap.base})`,
          backgroundSize: "cover",
        }}
      >
        <div className="p-5">
          <p className="text-sm font-bold uppercase tracking-widest text-secondary">
            My English Base
          </p>
          <h1 className="mt-1 text-3xl font-black text-primary">我的英语基地</h1>
          <p className="mt-2 text-lg font-bold">{playerName}</p>
        </div>
        <StatCard
          playerName={playerName}
          level={progress.level}
          xp={xp}
          currentLevelXp={progress.currentLevelXp}
          xpForNextLevel={progress.xpForNextLevel}
          percent={progress.percent}
          embedded
        />
      </section>

      <section className="mw-card p-5">
        <h2 className="text-xl font-black">资源栏 Resource Bar</h2>
        <div className="mw-resource-bar mt-4">
          {displayResources.map((resource) => (
            <ResourceBadge
              key={resource}
              resource={resource}
              amount={resources[resource]}
              compact
            />
          ))}
        </div>
      </section>

      <DailyAdventurePanel />

      <BaseDecorationPanel />

      <section className="mw-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">推荐任务</h2>
          <Link href="/quests" className="text-sm font-bold text-primary">
            全部任务 →
          </Link>
        </div>
        <div className="mt-3 grid gap-2 text-sm font-semibold text-muted">
          <p>已完成任务：{dailyStats.completedQuests}</p>
          <p>答对题数：{dailyStats.correctAnswers}</p>
          <p>学会单词：{dailyStats.learnedWords}</p>
        </div>
        <div className="mt-4 space-y-4">
          {recommendedQuests.length > 0 ? (
            recommendedQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                status={getQuestStatus(quest, xp, completedQuestIds)}
              />
            ))
          ) : (
            <p className="text-sm font-semibold text-muted">
              今天的推荐任务都完成啦！可以去词典或重复练习。
            </p>
          )}
        </div>
      </section>

      <section className="mw-card p-5">
        <h2 className="text-xl font-black">装备预览 Equipment</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {unlockedEquipment.length > 0 ? (
            unlockedEquipment.map((item) => (
              <InventorySlot
                key={item.id}
                icon={item.image ?? item.icon}
                label={item.nameCn}
                rarity={item.rarity}
              />
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
            className="mw-card flex flex-col items-center justify-center p-4 text-center font-black text-primary transition-transform hover:-translate-y-0.5"
          >
            <GameIcon src={link.icon} alt={link.label} size="lg" />
            <span className="mt-2">{link.label}</span>
          </Link>
        ))}
      </section>

      <div className="text-center">
        <Link href="/credits" className="text-xs font-semibold text-muted underline">
          素材致谢 Credits
        </Link>
        <span className="mx-2 text-muted">·</span>
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                "确定要重置全部进度吗？此操作无法撤销。Reset all progress?",
              )
            ) {
              resetProgress();
            }
          }}
          className="text-xs font-semibold text-muted underline"
        >
          Reset Progress 重置进度（测试用）
        </button>
      </div>
    </main>
  );
}
