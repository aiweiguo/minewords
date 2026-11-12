"use client";

import Link from "next/link";
import { useMemo } from "react";

import { GameIcon } from "@/components/GameIcon";
import { SpeakTradePanel } from "@/components/SpeakTradePanel";
import {
  canAffordTrade,
  getTradeOfferById,
  tradeOffers,
} from "@/data/trades";
import { useGameStore } from "@/store/useGameStore";

type TradePageClientProps = {
  initialOfferId?: string;
};

export function TradePageClient({ initialOfferId }: TradePageClientProps) {
  const resources = useGameStore((s) => s.resources);
  const unlockedIds = useGameStore((s) => s.unlockedIds);

  const activeId = useMemo(() => {
    if (initialOfferId && getTradeOfferById(initialOfferId)) {
      return initialOfferId;
    }
    const affordable = tradeOffers.find((offer) =>
      canAffordTrade(offer, resources),
    );
    return affordable?.id ?? tradeOffers[0]?.id ?? "buy-diamonds";
  }, [initialOfferId, resources]);

  const isTrader = unlockedIds.includes("village-trader");

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Trade</h1>
        <p className="mt-1 text-xl font-bold">开口交易</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          跟村民说买 / 换：绿宝石、金、钻石。Speak buy or trade keywords.
        </p>
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

      <section className="space-y-3">
        <h2 className="px-1 text-lg font-black">交易摊 Offers</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {tradeOffers.map((offer) => {
            const affordable = canAffordTrade(offer, resources);
            const selected = offer.id === activeId;
            return (
              <Link
                key={offer.id}
                href={`/trade?offer=${offer.id}`}
                className={`mw-card flex items-center gap-3 p-4 ${
                  selected
                    ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/40"
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
                    {affordable ? "可以交易 — 去开口" : "材料不够"}
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
