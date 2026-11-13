"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useMemo, useState } from "react";

import { QuestRunner } from "@/components/QuestRunner";
import { RewardModal } from "@/components/RewardModal";
import { getQuestById } from "@/data/quests";
import { getQuestStatus } from "@/lib/questEngine";
import { getWeaponGoalSnapshot } from "@/lib/weaponGoal";
import { useGameStore } from "@/store/useGameStore";

type QuestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function QuestDetailPage({ params }: QuestDetailPageProps) {
  const { id } = use(params);
  const quest = getQuestById(id);

  const xp = useGameStore((state) => state.xp);
  const resources = useGameStore((state) => state.resources);
  const unlockedIds = useGameStore((state) => state.unlockedIds);
  const roomBlocks = useGameStore((state) => state.roomBlocks);
  const completedQuestIds = useGameStore((state) => state.completedQuestIds);

  const [showRewardModal, setShowRewardModal] = useState(false);
  const [isFirstCompletion, setIsFirstCompletion] = useState(false);

  const status = useMemo(
    () =>
      quest
        ? getQuestStatus(quest, xp, completedQuestIds, unlockedIds)
        : "locked",
    [quest, xp, completedQuestIds, unlockedIds],
  );

  if (!quest) {
    notFound();
  }

  const locked = status === "locked";
  const goal = getWeaponGoalSnapshot(unlockedIds, resources, roomBlocks);
  const settleHref =
    quest.errand?.nudge === "trade"
      ? quest.errand.tradeOfferId
        ? `/trade?offer=${quest.errand.tradeOfferId}`
        : "/trade"
      : quest.errand?.nudge === "craft" || goal.canCraft
        ? `/crafting/${quest.errand?.weaponId ?? goal.goal?.id ?? ""}`
        : "/explore";

  function handleComplete(firstCompletion: boolean) {
    setIsFirstCompletion(firstCompletion);
    setShowRewardModal(true);
  }

  return (
    <main className="space-y-6">
      <Link href="/quests" className="text-sm font-bold text-primary">
        ← 返回材料委托
      </Link>

      <section className="mw-card p-6">
        <p className="text-xs font-black uppercase tracking-wide text-secondary">
          Material Errand
        </p>
        <h1 className="mt-1 text-3xl font-black">{quest.titleCn}</h1>
        <p className="mt-1 text-lg font-bold text-secondary">{quest.title}</p>
        <p className="mt-3 text-sm font-semibold text-muted">
          {quest.descriptionCn ?? quest.description}
        </p>

        {locked ? (
          <p className="mt-4 rounded-xl bg-black/30 px-4 py-3 text-sm font-bold text-amber-200">
            还没解锁这单委托。先做完当前武器目标，或先合成木剑再来洞穴线。
          </p>
        ) : null}
      </section>

      {!locked ? (
        <QuestRunner
          key={quest.id}
          quest={quest}
          practiceMode={false}
          onComplete={handleComplete}
        />
      ) : (
        <div className="flex flex-wrap gap-3">
          <Link href="/explore" className="mw-btn mw-btn-primary">
            出门打怪
          </Link>
          <Link href="/" className="mw-btn mw-btn-outline">
            回基地
          </Link>
        </div>
      )}

      <RewardModal
        open={showRewardModal}
        rewards={quest.rewards}
        unlocks={quest.unlocks ?? []}
        isFirstCompletion={isFirstCompletion}
        settleHref={settleHref.startsWith("/crafting/") ? settleHref : "/"}
        onClose={() => setShowRewardModal(false)}
      />
    </main>
  );
}
