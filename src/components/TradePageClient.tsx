"use client";

import Link from "next/link";
import { useMemo } from "react";

import { GameIcon } from "@/components/GameIcon";
import { SpeakTradePanel } from "@/components/SpeakTradePanel";
import { VillagerDeepChat } from "@/components/VillagerDeepChat";
import {
  canAffordTrade,
  getTradeOfferById,
  pickPreferredTradeOfferId,
  tradeOffers,
} from "@/data/trades";
import { getWeaponGoalSnapshot } from "@/lib/weaponGoal";
import { useGameStore } from "@/store/useGameStore";

type TradePageClientProps = {
  initialOfferId?: string;
};

export function TradePageClient({ initialOfferId }: TradePageClientProps) {
  const resources = useGameStore((s) => s.resources);
  const unlockedIds = useGameStore((s) => s.unlockedIds);
  const roomBlocks = useGameStore((s) => s.roomBlocks);
  const goal = getWeaponGoalSnapshot(unlockedIds, resources, roomBlocks);
  const chasingDiamond =
    goal.goal?.id === "diamond-sword" && goal.status === "gather";

  const activeId = useMemo(() => {
    if (initialOfferId && getTradeOfferById(initialOfferId)) {
      return initialOfferId;
    }
    return pickPreferredTradeOfferId(resources, goal.missing);
  }, [initialOfferId, resources, goal.missing]);

  const isTrader = unlockedIds.includes("village-trader");

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Village Trade</h1>
        <p className="mt-1 text-xl font-bold">村庄 · 找村民</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          出门到村：先和村民深聊（含农场词），再说买 / 换：木头、船、床、绿宝石、铁、钻石。
        </p>
        <p className="mt-1 text-xs font-semibold text-muted">
          和基地「找村民」是同一条路 · 也可从出门选区进村
        </p>
        {chasingDiamond ? (
          <p className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-900/25 px-3 py-2 text-sm font-bold text-emerald-100">
            当前目标：钻石剑 · 说{" "}
            <span className="text-emerald-50">Can I buy diamonds?</span>{" "}
            或用铁换钻石
          </p>
        ) : null}
        {isTrader ? (
          <p className="mt-2 text-xs font-bold text-green-200">
            ✓ 已解锁村民商人 Village trader
          </p>
        ) : (
          <p className="mt-2 text-xs font-semibold text-muted">
            完成一笔交易可解锁「村民商人」徽章。
          </p>
        )}
      </section>

      <VillagerDeepChat />

      <section className="space-y-3">
        <h2 className="px-1 text-lg font-black">交易摊 Offers</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {tradeOffers.map((offer) => {
            const affordable = canAffordTrade(offer, resources);
            const selected = offer.id === activeId;
            const helpsDiamond =
              chasingDiamond &&
              (offer.id === "buy-diamonds" ||
                offer.id === "iron-for-diamond" ||
                offer.id === "wood-for-emerald");
            return (
              <Link
                key={offer.id}
                href={`/trade?offer=${offer.id}`}
                className={`mw-card flex items-center gap-3 p-4 ${
                  selected
                    ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/40"
                    : helpsDiamond
                      ? "border-emerald-500/35"
                      : ""
                }`}
              >
                <GameIcon src={offer.icon} alt="" size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-black">{offer.titleCn}</p>
                  <p className="truncate text-sm font-bold text-secondary">
                    {offer.expectedSpeech}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted">
                    {affordable
                      ? "可以交易 — 去开口"
                      : helpsDiamond
                        ? "钻石剑材料线"
                        : "材料不够"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <SpeakTradePanel tradeId={activeId} />

      <div className="flex flex-wrap justify-center gap-2 pb-2">
        <Link href="/" className="mw-btn mw-btn-outline">
          回基地
        </Link>
        <Link href="/explore" className="mw-btn mw-btn-primary">
          出门打怪
        </Link>
        <Link href="/inventory" className="mw-btn mw-btn-outline">
          看背包
        </Link>
      </div>
    </main>
  );
}
