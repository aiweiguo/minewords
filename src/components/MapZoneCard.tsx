"use client";

import Link from "next/link";

import { QuestCard } from "@/components/QuestCard";
import { quests } from "@/data/quests";
import { mapAreaBackgrounds } from "@/lib/assets";
import { getQuestStatus } from "@/lib/questEngine";
import { MapZone } from "@/types";

type MapZoneCardProps = {
  zone: MapZone;
  index: number;
  locked: boolean;
  zoneQuestsCompleted: number;
  zoneQuestsTotal: number;
  xp: number;
  completedQuestIds: string[];
};

export function MapZoneCard({
  zone,
  index,
  locked,
  zoneQuestsCompleted,
  zoneQuestsTotal,
  xp,
  completedQuestIds,
}: MapZoneCardProps) {
  const complete = zoneQuestsTotal > 0 && zoneQuestsCompleted === zoneQuestsTotal;
  const background = mapAreaBackgrounds[zone.mapArea];

  return (
    <div
      className="relative"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {index > 0 ? (
        <div className="mw-map-connector mb-2 flex justify-center">
          <span className="mw-map-arrow text-2xl text-primary">↓</span>
        </div>
      ) : null}

      <section
        className={`mw-card mw-map-zone overflow-hidden transition-all duration-500 ${
          locked ? "opacity-60" : complete ? "mw-map-zone-complete" : "mw-map-zone-active"
        }`}
        style={{ animationDelay: `${index * 120}ms` }}
      >
        <div
          className="relative min-h-[120px] bg-cover bg-center p-5"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(26,31,22,0.55), rgba(26,31,22,0.92)), url(${background})`,
          }}
        >
          <div className="flex items-start gap-4">
            <span className={`text-4xl ${complete ? "mw-map-pulse" : ""}`}>{zone.emoji}</span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black">{zone.name}</h2>
                <span className="font-bold text-secondary">{zone.nameCn}</span>
                {locked ? (
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-800">
                    Lv {zone.requiredLevel} 解锁
                  </span>
                ) : complete ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                    区域完成 ✓
                  </span>
                ) : (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
                    探索中
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted">{zone.descriptionCn}</p>
              {zoneQuestsTotal > 0 ? (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs font-bold">
                    <span>任务进度</span>
                    <span>
                      {zoneQuestsCompleted} / {zoneQuestsTotal}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/30">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{
                        width: `${Math.round((zoneQuestsCompleted / zoneQuestsTotal) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
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
}
