"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { HubRoom } from "@/components/HubRoom";
import { useGameStore } from "@/store/useGameStore";
import { RoomBlockType } from "@/types";

const moreLinks = [
  { href: "/map", label: "地图" },
  { href: "/quests", label: "任务" },
  { href: "/speak", label: "口语" },
  { href: "/guides", label: "攻略" },
  { href: "/dictionary", label: "词典" },
  { href: "/minedex", label: "图鉴" },
  { href: "/create", label: "创意" },
  { href: "/listening", label: "听力" },
  { href: "/planner", label: "规划" },
  { href: "/unlocks", label: "解锁" },
  { href: "/inventory", label: "背包" },
  { href: "/crafting", label: "合成" },
  { href: "/parent", label: "家长" },
];

export default function HomePage() {
  const resetProgress = useGameStore((state) => state.resetProgress);
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<RoomBlockType>("plank");

  useEffect(() => {
    function syncHash() {
      if (window.location.hash === "#more") {
        setMoreOpen(true);
      }
    }
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  return (
    <main className="space-y-3">
      <HubRoom
        selectedBlock={selectedBlock}
        onSelectBlock={setSelectedBlock}
      />

      <section id="more" className="mw-card scroll-mt-4 p-3">
        <button
          type="button"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <h2 className="text-base font-black">更多</h2>
          <span className="text-lg font-black text-primary" aria-hidden>
            {moreOpen ? "−" : "+"}
          </span>
        </button>

        {moreOpen ? (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--panel-wood)]/40 pt-3 text-xs font-semibold text-muted">
              <Link href="/credits" className="underline">
                素材致谢
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "确定要重置全部进度吗？此操作无法撤销。",
                    )
                  ) {
                    resetProgress();
                  }
                }}
                className="underline"
              >
                重置进度（测试）
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
