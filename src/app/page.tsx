"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { HubRoom } from "@/components/HubRoom";
import { OnboardingCoach } from "@/components/OnboardingCoach";
import { useGameStore } from "@/store/useGameStore";
import { RoomBlockType } from "@/types";

/** Kid-facing secondary links only — fight/craft/explore stay on the hub stage. */
const moreLinks = [
  { href: "/quests", label: "材料委托" },
  { href: "/speak", label: "口语" },
  { href: "/map", label: "地图" },
  { href: "/create", label: "创意" },
  { href: "/unlocks", label: "解锁" },
  { href: "/inventory", label: "背包" },
  { href: "/parent", label: "家长" },
];

/** Encyclopedia / guides folded into one compact group (not a dashboard row). */
const lookupLinks = [
  { href: "/dictionary", label: "词典" },
  { href: "/minedex", label: "图鉴" },
  { href: "/guides", label: "攻略" },
];

export default function HomePage() {
  const resetProgress = useGameStore((state) => state.resetProgress);
  const [moreOpen, setMoreOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);
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
    <main className="mw-hub-home">
      <OnboardingCoach />
      <HubRoom
        selectedBlock={selectedBlock}
        onSelectBlock={setSelectedBlock}
      />

      <section id="more" className="mw-hub-more scroll-mt-4">
        <button
          type="button"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((open) => !open)}
          className="mw-hub-more-toggle"
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
                  className="mw-hub-more-link"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mw-hub-more-group">
              <button
                type="button"
                aria-expanded={lookupOpen}
                onClick={() => setLookupOpen((open) => !open)}
                className="mw-hub-more-group-toggle"
              >
                <span>查词</span>
                <span className="text-sm font-black text-primary" aria-hidden>
                  {lookupOpen ? "−" : "+"}
                </span>
              </button>
              {lookupOpen ? (
                <div className="mw-hub-more-sublinks" role="group" aria-label="查词">
                  {lookupLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="mw-hub-more-sublink"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
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
