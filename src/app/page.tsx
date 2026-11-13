"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BaseDecorationPanel } from "@/components/BaseDecorationPanel";
import { HubRoom } from "@/components/HubRoom";
import { OnboardingCoach } from "@/components/OnboardingCoach";
import { useGameStore } from "@/store/useGameStore";
import { RoomBlockType } from "@/types";

/**
 * Kid-facing secondary links only — fight/craft/explore stay on the hub stage.
 * Post-iron 句子训练 (/speak) is appended when iron-sword is unlocked (P2-2 / MW-48).
 * /map is display-only 区域进度 (P2-3 / MW-49); 出门 adventure exit is /explore only.
 */
const moreLinksBase = [
  { href: "/quests", label: "材料委托" },
  { href: "/map", label: "区域进度" },
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
  const unlockedIds = useGameStore((state) => state.unlockedIds);
  const hasIronSword = unlockedIds.includes("iron-sword");
  const moreLinks = hasIronSword
    ? [
        ...moreLinksBase.slice(0, 1),
        { href: "/speak", label: "句子训练" },
        ...moreLinksBase.slice(1),
      ]
    : moreLinksBase;
  const [moreOpen, setMoreOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [decorateOpen, setDecorateOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<RoomBlockType>("plank");

  useEffect(() => {
    function syncHash() {
      const hash = window.location.hash;
      if (hash === "#more") {
        setMoreOpen(true);
      }
      if (hash === "#decorate") {
        setDecorateOpen(true);
        window.requestAnimationFrame(() => {
          document
            .getElementById("decorate")
            ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
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

      <BaseDecorationPanel
        variant="hub"
        open={decorateOpen}
        onOpenChange={setDecorateOpen}
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
