"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useMemo, useState } from "react";

import { QuestRunner } from "@/components/QuestRunner";
import { RewardModal } from "@/components/RewardModal";
import { getQuestById } from "@/data/quests";
import { getQuestStatus } from "@/lib/questEngine";
import { useGameStore } from "@/store/useGameStore";

type QuestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function QuestDetailPage({ params }: QuestDetailPageProps) {
  const { id } = use(params);
  const quest = getQuestById(id);

  const xp = useGameStore((state) => state.xp);
  const completedQuestIds = useGameStore((state) => state.completedQuestIds);

  const [started, setStarted] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [isFirstCompletion, setIsFirstCompletion] = useState(false);

  const status = useMemo(
    () => (quest ? getQuestStatus(quest, xp, completedQuestIds) : "locked"),
    [quest, xp, completedQuestIds],
  );

  if (!quest) {
    notFound();
  }

  const practiceMode = status === "completed";
  const locked = status === "locked";

  function handleComplete(firstCompletion: boolean) {
    setIsFirstCompletion(firstCompletion);
    setShowRewardModal(true);
  }

  return (
    <main className="space-y-6">
      <Link href="/quests" className="text-sm font-bold text-primary">
        ← 返回任务列表
      </Link>

      <section className="mw-card p-6">
        <h1 className="text-3xl font-black">{quest.title}</h1>
        <p className="mt-1 text-xl font-bold text-secondary">{quest.titleCn}</p>
        <p className="mt-3 text-sm font-semibold text-muted">{quest.description}</p>
        <p className="mt-2 text-sm font-bold">需要等级：Lv {quest.requiredLevel}</p>

        {locked ? (
          <p className="mt-4 rounded-xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-700">
            等级不足，先去完成其他任务升级吧。
          </p>
        ) : null}

        {practiceMode ? (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
            练习模式：可以重复答题，但不会重复领取奖励。
          </p>
        ) : null}

        {!started && !locked ? (
          <button
            type="button"
            className="mw-btn mw-btn-primary mt-6"
            onClick={() => setStarted(true)}
          >
            Start Quest 开始任务
          </button>
        ) : null}
      </section>

      {started && !locked ? (
        <QuestRunner
          key={`${quest.id}-${practiceMode ? "practice" : "live"}`}
          quest={quest}
          practiceMode={practiceMode}
          onComplete={handleComplete}
        />
      ) : null}

      <RewardModal
        open={showRewardModal}
        rewards={quest.rewards}
        unlocks={quest.unlocks ?? []}
        isFirstCompletion={isFirstCompletion}
        onClose={() => setShowRewardModal(false)}
      />
    </main>
  );
}
