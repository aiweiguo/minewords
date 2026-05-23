"use client";

import Link from "next/link";

import { guides } from "@/data/guides";
import { vocabulary } from "@/data/vocabulary";
import { getTodayDateString } from "@/lib/dailyAdventure";
import { useGameStore } from "@/store/useGameStore";

export default function ParentPage() {
  const playerName = useGameStore((s) => s.playerName);
  const xp = useGameStore((s) => s.xp);
  const dailyStats = useGameStore((s) => s.dailyStats);
  const masteredWordIds = useGameStore((s) => s.masteredWordIds);
  const learnedWordIds = useGameStore((s) => s.learnedWordIds);
  const discoveredWordIds = useGameStore((s) => s.discoveredWordIds);
  const completedQuestIds = useGameStore((s) => s.completedQuestIds);
  const completedGuideIds = useGameStore((s) => s.completedGuideIds);

  const level = Math.floor(xp / 100) + 1;

  const masteredWords = vocabulary.filter((w) => masteredWordIds.includes(w.id));
  const learnedNotMastered = vocabulary.filter(
    (w) => learnedWordIds.includes(w.id) && !masteredWordIds.includes(w.id),
  );

  const todayActive = dailyStats.date === getTodayDateString();

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Parent Summary</h1>
        <p className="mt-1 text-xl font-bold">家长学习报告</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          简单查看 {playerName} 的学习进度（本地数据，无账号同步）
        </p>
      </section>

      <section className="mw-card p-5">
        <h2 className="text-xl font-black">今日概览</h2>
        {todayActive ? (
          <ul className="mt-4 space-y-2 text-sm font-semibold">
            <li>完成任务：{dailyStats.completedQuests} 个</li>
            <li>答对题数：{dailyStats.correctAnswers} 题</li>
            <li>新学单词：{dailyStats.learnedWords} 个</li>
            <li>
              今日冒险：{dailyStats.dailyAdventureCompleted ? "已完成 ✓" : "未完成"}
            </li>
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">今天还没有学习记录，打开 App 开始吧。</p>
        )}
      </section>

      <section className="mw-card p-5">
        <h2 className="text-xl font-black">总体进度</h2>
        <ul className="mt-4 space-y-2 text-sm font-semibold">
          <li>等级：Lv {level}</li>
          <li>总 XP：{xp}</li>
          <li>已完成任务：{completedQuestIds.length} / 8</li>
          <li>已完成攻略：{completedGuideIds.length} / {guides.length}</li>
          <li>已发现单词：{discoveredWordIds.length} / {vocabulary.length}</li>
          <li>已学习单词：{learnedWordIds.length}</li>
          <li>已掌握单词：{masteredWordIds.length}</li>
        </ul>
      </section>

      {masteredWords.length > 0 ? (
        <section className="mw-card p-5">
          <h2 className="text-xl font-black">已掌握</h2>
          <p className="mt-2 text-sm font-semibold text-muted">
            {masteredWords.map((w) => `${w.english} (${w.chinese})`).join("、")}
          </p>
        </section>
      ) : null}

      {learnedNotMastered.length > 0 ? (
        <section className="mw-card p-5">
          <h2 className="text-xl font-black">建议复习</h2>
          <p className="mt-2 text-sm font-semibold text-muted">
            {learnedNotMastered.slice(0, 10).map((w) => w.english).join("、")}
            {learnedNotMastered.length > 10 ? "…" : ""}
          </p>
        </section>
      ) : null}

      <div className="text-center">
        <Link href="/" className="text-sm font-bold text-primary underline">
          ← 返回基地
        </Link>
      </div>
    </main>
  );
}
