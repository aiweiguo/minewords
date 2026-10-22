"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { GameIcon } from "@/components/GameIcon";
import { HubRoom } from "@/components/HubRoom";
import { displayResources, ResourceBadge } from "@/components/ResourceBadge";
import { assetMap } from "@/lib/assets";
import { getXpProgress } from "@/lib/progress";
import { useGameStore } from "@/store/useGameStore";
import { RoomBlockType } from "@/types";

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
  { href: "/inventory", label: "背包 Inventory" },
  { href: "/crafting", label: "合成 Crafting" },
];

export default function HomePage() {
  const playerName = useGameStore((state) => state.playerName);
  const xp = useGameStore((state) => state.xp);
  const resources = useGameStore((state) => state.resources);
  const roomBlocks = useGameStore((state) => state.roomBlocks);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<RoomBlockType>("plank");

  const progress = getXpProgress(xp);
  const materialTotal = useMemo(
    () => Object.values(resources).reduce((sum, amount) => sum + amount, 0),
    [resources],
  );
  const placedCount = Object.keys(roomBlocks).length;
  const roomEmpty = placedCount === 0;

  return (
    <main className="space-y-4">
      <HubRoom
        selectedBlock={selectedBlock}
        onSelectBlock={setSelectedBlock}
      />

      <section className="mw-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black">材料箱 Materials</h2>
            <p className="text-xs font-semibold text-muted">
              {playerName} · Lv.{progress.level}
            </p>
          </div>
          <Link
            href="/review"
            className="mw-btn mw-btn-primary mw-home-cta shrink-0 px-4 py-2 text-sm sm:text-base"
          >
            <GameIcon src={assetMap.sword} alt="" size="sm" />
            出门打怪 Fight
          </Link>
        </div>

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

        {roomEmpty && materialTotal === 0 ? (
          <p className="text-center text-sm font-semibold text-muted">
            空房间 — 先出门打怪攒木头/石头
            <span className="mt-0.5 block text-xs">
              Empty room · fight for wood & stone, then place blocks
            </span>
          </p>
        ) : null}
        {roomEmpty && materialTotal > 0 ? (
          <p className="text-center text-sm font-semibold text-secondary">
            有材料了 — 点上方空槽铺地板/墙
            <span className="mt-0.5 block text-xs">
              Materials ready · tap empty slots in the room
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
