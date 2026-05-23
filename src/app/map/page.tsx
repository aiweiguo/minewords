"use client";

import Link from "next/link";

import { QuestCard } from "@/components/QuestCard";
import { mapZones } from "@/data/mapZones";
import { quests } from "@/data/quests";
import { getQuestStatus } from "@/lib/questEngine";
import { getXpProgress } from "@/lib/progress";
import { useGameStore } from "@/store/useGameStore";

export default function MapPage() {
  const xp = useGameStore((s) => s.xp);
  const completedQuestIds = useGameStore((s) => s.completedQuestIds);
  const progress = getXpProgress(xp);

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Quest Map</h1>
        <p className="mt-1 text-xl font-bold">任务地图</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          从森林出发，一路闯到末地！当前等级 Lv {progress.level}
        </p>
      </section>

      <div className="relative space-y-4">
        {mapZones.map((zone, index) => {
          const locked = progress.level < zone.requiredLevel;
          const zoneQuestsCompleted = zone.questIds.filter((id) =>
            completedQuestIds.includes(id),
          ).length;
          const zoneQuestsTotal = zone.questIds.length;

          return (
            <div key={zone.id} className="relative">
              {index > 0 ? (
                <div className="mb-2 flex justify-center text-2xl text-primary">↓</div>
              ) : null}
              <section
                className={`mw-card overflow-hidden ${locked ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-4 p-5">
                  <span className="text-4xl">{zone.emoji}</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black">{zone.name}</h2>
                      <span className="font-bold text-secondary">{zone.nameCn}</span>
                      {locked ? (
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold">
                          Lv {zone.requiredLevel} 解锁
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
                          已解锁
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted">{zone.descriptionCn}</p>
                    {zoneQuestsTotal > 0 ? (
                      <p className="mt-2 text-sm font-bold">
                        任务进度：{zoneQuestsCompleted} / {zoneQuestsTotal}
                      </p>
                    ) : null}
                  </div>
                </div>

                {zone.questIds.length > 0 && !locked ? (
                  <div className="space-y-3 border-t border-[#d9e2cc] p-4">
                    {zone.questIds.map((questId) => {
                      const quest = quests.find((q) => q.id === questId);
                      if (!quest) return null;
                      return (
                        <QuestCard
                          key={questId}
                          quest={quest}
                          status={getQuestStatus(quest, xp, completedQuestIds)}
                        />
                      );
                    })}
                  </div>
                ) : null}

                {locked ? null : zone.questIds.length === 0 ? (
                  <div className="border-t border-[#d9e2cc] p-4">
                    <Link href="/guides" className="mw-btn mw-btn-outline text-sm">
                      去攻略库探索 →
                    </Link>
                  </div>
                ) : null}
              </section>
            </div>
          );
        })}
      </div>
    </main>
  );
}
