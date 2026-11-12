"use client";

import Link from "next/link";

import { QuestCard } from "@/components/QuestCard";
import { WeaponGoalStrip } from "@/components/WeaponGoalStrip";
import { getWeaponTierById } from "@/data/weapons";
import {
  getQuestStatus,
  listRelevantErrands,
} from "@/lib/questEngine";
import { getCurrentWeaponGoal } from "@/lib/weaponGoal";
import { useGameStore } from "@/store/useGameStore";

export default function QuestsPage() {
  const xp = useGameStore((state) => state.xp);
  const resources = useGameStore((state) => state.resources);
  const unlockedIds = useGameStore((state) => state.unlockedIds);
  const completedQuestIds = useGameStore((state) => state.completedQuestIds);
  const errandProgress = useGameStore((state) => state.errandProgress);

  const goal = getCurrentWeaponGoal(unlockedIds);
  const relevant = listRelevantErrands(unlockedIds, completedQuestIds);
  const goalTier = goal ? getWeaponTierById(goal.id) : null;

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <p className="text-xs font-black uppercase tracking-wide text-secondary">
          Secondary · 更多
        </p>
        <h1 className="mt-1 text-3xl font-black text-primary">材料委托</h1>
        <p className="mt-2 text-sm font-semibold text-muted">
          为当前武器目标凑材料的短差事。主线仍是出门打怪 → 合成。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/explore" className="mw-btn mw-btn-primary text-sm">
            出门打怪
          </Link>
          <Link href="/crafting" className="mw-btn mw-btn-outline text-sm">
            去合成
          </Link>
        </div>
      </section>

      <WeaponGoalStrip variant="settle" />

      <section className="space-y-4">
        <h2 className="text-2xl font-black">
          {goalTier
            ? `目标：${goalTier.goalLabelCn}`
            : "武器线已完成"}
        </h2>
        {relevant.length === 0 ? (
          <p className="rounded-xl bg-black/20 px-4 py-3 text-sm font-semibold text-muted">
            暂时没有委托。去打怪或合成下一把武器吧。
          </p>
        ) : (
          <div className="grid gap-4">
            {relevant.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                status={getQuestStatus(quest, xp, completedQuestIds, unlockedIds)}
                errandProgress={errandProgress}
                resources={resources}
                unlockedIds={unlockedIds}
                completedQuestIds={completedQuestIds}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
