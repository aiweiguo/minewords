"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { GameIcon } from "@/components/GameIcon";
import { displayResources, ResourceBadge } from "@/components/ResourceBadge";
import { assetMap, backgroundMap } from "@/lib/assets";
import { getXpProgress } from "@/lib/progress";
import { useGameStore } from "@/store/useGameStore";

const moreLinks = [
  { href: "/map", label: "地图 Map" },
  { href: "/quests", label: "任务 Quests" },
  { href: "/speak", label: "口语 Speak" },
  { href: "/guides", label: "攻略 Guides" },
  { href: "/dictionary", label: "词典 Dictionary" },
  { href: "/minedex", label: "图鉴 MineDex" },
  { href: "/review", label: "打怪 Battle" },
  { href: "/planner", label: "规划 Planner" },
  { href: "/create", label: "创意 Create" },
  { href: "/listening", label: "听力 Listening" },
  { href: "/unlocks", label: "解锁 Unlocks" },
  { href: "/parent", label: "家长 Parent" },
];

export default function HomePage() {
  const playerName = useGameStore((state) => state.playerName);
  const xp = useGameStore((state) => state.xp);
  const resources = useGameStore((state) => state.resources);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const [moreOpen, setMoreOpen] = useState(false);

  const progress = getXpProgress(xp);
  const materialTotal = useMemo(
    () => Object.values(resources).reduce((sum, amount) => sum + amount, 0),
    [resources],
  );
  const hasMaterials = materialTotal > 0;

  return (
    <main className="space-y-5">
      <section
        className="mw-game-panel overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(26,31,22,0.72), rgba(26,31,22,0.94)), url(${backgroundMap.battle})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex min-h-[min(72vh,34rem)] flex-col justify-between gap-6 p-5 sm:p-7">
          <div>
            <h1 className="text-4xl font-black leading-tight text-primary sm:text-5xl">
              MineWords
            </h1>
            <p className="mt-3 max-w-md text-lg font-bold text-foreground sm:text-xl">
              开口打怪，攒材料
            </p>
            <p className="mt-1 text-sm font-semibold text-muted">
              Speak to attack · gather materials
            </p>
            <p className="mt-4 text-sm font-semibold text-muted">
              {playerName} · Lv.{progress.level}
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/review"
              className="mw-btn mw-btn-primary mw-home-cta w-full text-xl sm:text-2xl"
            >
              <GameIcon src={assetMap.sword} alt="" size="md" />
              去打怪 Go Fight
            </Link>

            <div className="mw-resource-bar">
              {displayResources.map((resource) => (
                <ResourceBadge
                  key={resource}
                  resource={resource}
                  amount={resources[resource]}
                  compact
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className={`grid gap-3 sm:grid-cols-2 ${
          hasMaterials ? "mw-home-craft-ready" : ""
        }`}
      >
        <Link
          href="/inventory"
          className={`mw-btn inline-flex w-full justify-center ${
            hasMaterials ? "mw-btn-secondary text-base" : "mw-btn-outline text-sm"
          }`}
        >
          <GameIcon src={assetMap.chest} alt="" size="sm" />
          背包 Inventory
          {hasMaterials ? (
            <span className="rounded bg-black/35 px-2 py-0.5 text-xs">
              x{materialTotal}
            </span>
          ) : null}
        </Link>
        <Link
          href="/crafting"
          className={`mw-btn inline-flex w-full justify-center ${
            hasMaterials ? "mw-btn-secondary text-base" : "mw-btn-outline text-sm"
          }`}
        >
          <GameIcon src={assetMap.axe} alt="" size="sm" />
          合成 Crafting
        </Link>
        {hasMaterials ? (
          <p className="sm:col-span-2 text-center text-sm font-semibold text-secondary">
            已有材料 — 去背包看看，或读材料名来合成
            <span className="block text-muted">
              Materials ready · bag or craft next
            </span>
          </p>
        ) : null}
      </section>

      <section className="mw-card p-4">
        <button
          type="button"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <div>
            <h2 className="text-lg font-black">更多 More</h2>
            <p className="text-sm font-semibold text-muted">
              地图、任务、词典、攻略…
            </p>
          </div>
          <span className="text-xl font-black text-primary" aria-hidden>
            {moreOpen ? "−" : "+"}
          </span>
        </button>

        {moreOpen ? (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {moreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md border border-[var(--panel-wood)]/60 bg-black/20 px-3 py-2 text-sm font-bold text-muted transition-colors hover:bg-black/35 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <div className="text-center">
        <Link href="/credits" className="text-xs font-semibold text-muted underline">
          素材致谢 Credits
        </Link>
        <span className="mx-2 text-muted">·</span>
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                "确定要重置全部进度吗？此操作无法撤销。Reset all progress?",
              )
            ) {
              resetProgress();
            }
          }}
          className="text-xs font-semibold text-muted underline"
        >
          Reset Progress 重置进度（测试用）
        </button>
      </div>
    </main>
  );
}
