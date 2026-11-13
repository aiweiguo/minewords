"use client";

import Link from "next/link";

import { MapZoneCard } from "@/components/MapZoneCard";
import { mapZones } from "@/data/mapZones";
import { getXpProgress } from "@/lib/progress";
import { useGameStore } from "@/store/useGameStore";

/**
 * Display-only zone / errand progress (P2-3 / MW-49).
 * Adventure exit stays on /explore — this page does not compete as a second map door.
 * Deep links to /map keep working (no hard break).
 */
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
        <p className="text-xs font-bold uppercase tracking-wide text-muted">
          更多 · 只看进度
        </p>
        <h1 className="mt-1 text-3xl font-black text-primary">Zone Progress</h1>
        <p className="mt-1 text-xl font-bold">区域进度</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          这里只看委托和区域完成度。真要出门选区打怪，走底部「出门」或基地大门（/explore）。Lv{" "}
          {progress.level}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/explore" className="mw-btn mw-btn-outline text-sm">
            去出门选区
          </Link>
          <Link href="/quests" className="mw-btn mw-btn-outline text-sm">
            材料委托
          </Link>
          <Link href="/" className="mw-btn mw-btn-outline text-sm">
            回基地
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
