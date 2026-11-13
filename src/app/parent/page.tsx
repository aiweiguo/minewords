"use client";

import Link from "next/link";
import { useMemo } from "react";

import { guides } from "@/data/guides";
import { quests } from "@/data/quests";
import { getVocabularyById, vocabulary } from "@/data/vocabulary";
import { speakScenarios } from "@/data/speakScenarios";
import { getTodayDateString } from "@/lib/dailyAdventure";
import {
  confirmSharePercent,
  isMostlyConfirmToday,
  isMostlyConfirmWeek,
} from "@/lib/followConfirm";
import { ProgressBackupPanel } from "@/components/ProgressBackupPanel";
import { getTonightThreeThings } from "@/lib/parentTonight";
import { MONSTER_WRONG_THRESHOLD } from "@/lib/wrongWord";
import { normalizeWeekSpeakStats, useGameStore } from "@/store/useGameStore";

export default function ParentPage() {
  const playerName = useGameStore((s) => s.playerName);
  const xp = useGameStore((s) => s.xp);
  const resources = useGameStore((s) => s.resources);
  const roomBlocks = useGameStore((s) => s.roomBlocks);
  const dailyStats = useGameStore((s) => s.dailyStats);
  const weekSpeakStatsRaw = useGameStore((s) => s.weekSpeakStats);
  const masteredWordIds = useGameStore((s) => s.masteredWordIds);
  const learnedWordIds = useGameStore((s) => s.learnedWordIds);
  const discoveredWordIds = useGameStore((s) => s.discoveredWordIds);
  const completedQuestIds = useGameStore((s) => s.completedQuestIds);
  const completedGuideIds = useGameStore((s) => s.completedGuideIds);
  const completedSpeakIds = useGameStore((s) => s.completedSpeakIds);
  const wrongWordCounts = useGameStore((s) => s.wrongWordCounts);
  const defeatedMonsterIds = useGameStore((s) => s.defeatedMonsterIds);
  const unlockedIds = useGameStore((s) => s.unlockedIds);
  const learningStreak = useGameStore((s) => s.learningStreak);

  const level = Math.floor(xp / 100) + 1;

  const masteredWords = vocabulary.filter((w) => masteredWordIds.includes(w.id));
  const learnedNotMastered = vocabulary.filter(
    (w) => learnedWordIds.includes(w.id) && !masteredWordIds.includes(w.id),
  );

  const reviewWords = Object.entries(wrongWordCounts)
    .filter(
      ([wordId, count]) =>
        count >= MONSTER_WRONG_THRESHOLD && !defeatedMonsterIds.includes(wordId),
    )
    .map(([wordId]) => getVocabularyById(wordId))
    .filter(Boolean);

  const todayActive = dailyStats.date === getTodayDateString();

  const todayMastered = dailyStats.masteredTodayIds
    .map((id) => getVocabularyById(id)?.english)
    .filter(Boolean);

  const todaySummary =
    todayMastered.length > 0
      ? `今天掌握：${todayMastered.join(", ")}`
      : dailyStats.learnedWords > 0
        ? `今天新学 ${dailyStats.learnedWords} 个单词，继续加油！`
        : "今天还没有新掌握的单词。";

  const reviewSummary =
    reviewWords.length > 0
      ? `需要复习：${reviewWords.map((w) => w!.english).join(", ")}`
      : "目前没有活跃错词怪物。";

  const tonightThree = useMemo(
    () =>
      getTonightThreeThings({
        unlockedIds,
        resources,
        roomBlocks,
        wrongWordCounts,
        defeatedMonsterIds,
        learnedWordIds,
        masteredWordIds,
        dailyStats,
      }),
    [
      unlockedIds,
      resources,
      roomBlocks,
      wrongWordCounts,
      defeatedMonsterIds,
      learnedWordIds,
      masteredWordIds,
      dailyStats,
    ],
  );

  const weekSpeakStats = normalizeWeekSpeakStats(weekSpeakStatsRaw, dailyStats);
  const weekConfirmShare = confirmSharePercent(
    weekSpeakStats.speakCompletions,
    weekSpeakStats.confirmCompletions,
  );
  const weekMostlyConfirm = isMostlyConfirmWeek(
    weekSpeakStats.speakCompletions,
    weekSpeakStats.confirmCompletions,
  );

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">今晚三件事</h1>
        <p className="mt-1 text-xl font-bold">陪 {playerName} 的行动清单</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          按当前进度挑好的三件小事——不是成绩仪表盘。
        </p>
      </section>

      <section
        className="mw-card mw-reward-panel p-5"
        aria-labelledby="mw-parent-tonight"
      >
        <h2 id="mw-parent-tonight" className="sr-only">
          今晚三件事列表
        </h2>
        <ol className="space-y-4">
          {tonightThree.map((thing, index) => (
            <li key={thing.id}>
              <Link
                href={thing.href}
                className="block rounded-xl border border-[var(--panel-wood)]/50 bg-black/20 px-4 py-3 transition hover:bg-black/35"
              >
                <p className="text-sm font-black text-primary">
                  {index + 1}. {thing.labelCn}
                </p>
                <p className="mt-1 text-sm font-semibold text-muted">
                  {thing.detailCn}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mw-card p-5" aria-labelledby="mw-parent-week-ratio">
        <h2 id="mw-parent-week-ratio" className="text-xl font-black">
          本周开口 vs 确认
        </h2>
        {weekConfirmShare !== null ? (
          <>
            <ul className="mt-4 space-y-2 text-sm font-semibold">
              <li>开口过关（麦克风）：{weekSpeakStats.speakCompletions} 次</li>
              <li>
                确认过关（含跟读模式）：{weekSpeakStats.confirmCompletions} 次
              </li>
              <li>确认占比：{weekConfirmShare}%</li>
            </ul>
            <p
              className={`mt-4 rounded-xl px-4 py-3 text-sm font-black ${
                weekMostlyConfirm
                  ? "bg-amber-900/40 text-amber-100"
                  : "bg-green-900/30 text-green-100"
              }`}
              role="status"
            >
              {weekMostlyConfirm
                ? "本周是否主要靠确认过关：是 — 建议换 Chrome 开口，或陪孩子真的跟读。"
                : "本周是否主要靠确认过关：否 — 开口过关占多数，很好！"}
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted">
            本周还没有开口或确认过关记录（从本周一开始累计）。
          </p>
        )}
      </section>

      <section className="mw-card p-5" aria-labelledby="mw-parent-device-note">
        <h2 id="mw-parent-device-note" className="text-xl font-black">
          设备与玩法
        </h2>
        <p className="mt-3 text-sm font-semibold leading-relaxed">
          推荐用 <strong>Chrome</strong>（桌面或 Android）开口打怪、合成、交易。
          没有麦克风或浏览器不支持语音时，会进入「跟读模式」：先听 TTS、跟读倒计时，再允许点确认——
          <strong>开口说英语才是正玩法</strong>。
        </p>
        <p className="mt-2 text-sm font-semibold text-muted leading-relaxed">
          iPhone / Safari 等常无语音识别：请换 Chrome，或让孩子走完听+跟读再确认。
        </p>
      </section>

      <ProgressBackupPanel />

      <section className="mw-card p-5" aria-labelledby="mw-parent-tools">
        <h2 id="mw-parent-tools" className="text-xl font-black">
          家长工具
        </h2>
        <p className="mt-2 text-sm font-semibold text-muted">
          听力和材料规划不在孩子主菜单里，需要时从这里进。
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/listening"
            className="inline-flex min-h-11 items-center rounded-md border border-[var(--panel-wood)]/60 bg-black/20 px-4 py-2 text-sm font-bold text-primary underline-offset-2 hover:bg-black/35"
          >
            听力练习 →
          </Link>
          <Link
            href="/planner"
            className="inline-flex min-h-11 items-center rounded-md border border-[var(--panel-wood)]/60 bg-black/20 px-4 py-2 text-sm font-bold text-primary underline-offset-2 hover:bg-black/35"
          >
            材料规划 →
          </Link>
        </div>
      </section>

      <section className="mw-card mw-reward-panel p-5">
        <h2 className="text-xl font-black">一句话总结</h2>
        <p className="mt-3 text-sm font-semibold">{todaySummary}</p>
        <p className="mt-2 text-sm font-semibold text-amber-200">{reviewSummary}</p>
      </section>

      <section className="mw-card p-5" aria-labelledby="mw-parent-confirm-rate">
        <h2 id="mw-parent-confirm-rate" className="text-xl font-black">
          今日开口 vs 确认
        </h2>
        {todayActive &&
        dailyStats.speakCompletions + dailyStats.confirmCompletions > 0 ? (
          <>
            <ul className="mt-4 space-y-2 text-sm font-semibold">
              <li>开口过关（麦克风）：{dailyStats.speakCompletions} 次</li>
              <li>确认过关（含跟读模式）：{dailyStats.confirmCompletions} 次</li>
            </ul>
            <p
              className={`mt-4 rounded-xl px-4 py-3 text-sm font-black ${
                isMostlyConfirmToday(
                  dailyStats.speakCompletions,
                  dailyStats.confirmCompletions,
                )
                  ? "bg-amber-900/40 text-amber-100"
                  : "bg-green-900/30 text-green-100"
              }`}
              role="status"
            >
              {isMostlyConfirmToday(
                dailyStats.speakCompletions,
                dailyStats.confirmCompletions,
              )
                ? "今日是否主要靠确认过关：是 — 建议换 Chrome 开口，或陪孩子真的跟读。"
                : "今日是否主要靠确认过关：否 — 开口过关占多数，很好！"}
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted">
            今天还没有开口或确认过关记录。
          </p>
        )}
      </section>

      <section className="mw-card p-5">
        <h2 className="text-xl font-black">今日概览</h2>
        {todayActive ? (
          <ul className="mt-4 space-y-2 text-sm font-semibold">
            <li>完成委托：{dailyStats.completedQuests} 个</li>
            <li>领取创意：{dailyStats.buildIdeasClaimed} 个</li>
            <li>完成冒险：{dailyStats.adventuresCompleted} 次</li>
            <li>答对题数：{dailyStats.correctAnswers} 题</li>
            <li>新学单词：{dailyStats.learnedWords} 个</li>
            <li>口语尝试：{dailyStats.speakAttempts} 次</li>
            <li>开口过关：{dailyStats.speakCompletions} 次</li>
            <li>确认过关：{dailyStats.confirmCompletions} 次</li>
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
          <li>连续学习：{learningStreak} 天</li>
          <li>已完成委托：{completedQuestIds.length} / {quests.length}</li>
          <li>已完成攻略：{completedGuideIds.length} / {guides.length}</li>
          <li>已完成口语场景：{completedSpeakIds.length} / {speakScenarios.length}</li>
          <li>已发现单词：{discoveredWordIds.length} / {vocabulary.length}</li>
          <li>已学习单词：{learnedWordIds.length}</li>
          <li>已掌握单词：{masteredWordIds.length}</li>
          <li>已击败错词怪：{defeatedMonsterIds.length} 个</li>
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

      {reviewWords.length > 0 ? (
        <section className="mw-card p-5">
          <h2 className="text-xl font-black">错词怪物</h2>
          <p className="mt-2 text-sm font-semibold text-muted">
            {reviewWords.map((w) => `${w!.english} (${w!.chinese})`).join("、")}
          </p>
          <Link href="/fight" className="mt-4 inline-flex text-sm font-bold text-primary underline">
            去打怪 →
          </Link>
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
