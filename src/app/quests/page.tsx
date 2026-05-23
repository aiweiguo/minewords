"use client";

import { mapAreaLabels, quests } from "@/data/quests";
import { QuestCard } from "@/components/QuestCard";
import { getQuestStatus } from "@/lib/questEngine";
import { useGameStore } from "@/store/useGameStore";
import { MapArea } from "@/types";

const groupedAreas: MapArea[] = ["forest", "cave", "battle"];

export default function QuestsPage() {
  const xp = useGameStore((state) => state.xp);
  const completedQuestIds = useGameStore((state) => state.completedQuestIds);

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Quests 任务</h1>
        <p className="mt-2 text-sm font-semibold text-muted">
          按地图区域完成任务，获得资源和装备。
        </p>
      </section>

      {groupedAreas.map((area) => {
        const areaQuests = quests.filter((quest) => quest.mapArea === area);
        const label = mapAreaLabels[area];

        return (
          <section key={area} className="space-y-4">
            <h2 className="text-2xl font-black">
              {label.en} {label.cn}
            </h2>
            <div className="grid gap-4">
              {areaQuests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  status={getQuestStatus(quest, xp, completedQuestIds)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
