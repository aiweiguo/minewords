"use client";

import Link from "next/link";

import { MapZoneCard } from "@/components/MapZoneCard";
import { mapZones } from "@/data/mapZones";
import { getXpProgress } from "@/lib/progress";
import { useGameStore } from "@/store/useGameStore";

export default function MapPage() {
  const xp = useGameStore((s) => s.xp);
  const resources = useGameStore((s) => s.resources);
  const unlockedIds = useGameStore((s) => s.unlockedIds);
  const completedQuestIds = useGameStore((s) => s.completedQuestIds);
  const errandProgress = useGameStore((s) => s.errandProgress);
  const progress = getXpProgress(xp);

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Explore Map</h1>
        <p className="mt-1 text-xl font-bold">探索地图</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          委托跟着武器目标走。主线仍是出门打怪 → 合成。Lv {progress.level}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/explore" className="mw-btn mw-btn-primary text-sm">
            出门打怪
          </Link>
          <Link href="/quests" className="mw-btn mw-btn-outline text-sm">
            材料委托
          </Link>
        </div>
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
              unlockedIds={unlockedIds}
              errandProgress={errandProgress}
              resources={resources}
            />
          );
        })}
      </div>
    </main>
  );
}
