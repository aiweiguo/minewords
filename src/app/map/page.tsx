"use client";

import { MapZoneCard } from "@/components/MapZoneCard";
import { mapZones } from "@/data/mapZones";
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

          return (
            <MapZoneCard
              key={zone.id}
              zone={zone}
              index={index}
              locked={locked}
              zoneQuestsCompleted={zoneQuestsCompleted}
              zoneQuestsTotal={zone.questIds.length}
              xp={xp}
              completedQuestIds={completedQuestIds}
            />
          );
        })}
      </div>
    </main>
  );
}
