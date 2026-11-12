import { Suspense } from "react";

import { TradePageClient } from "@/components/TradePageClient";

type TradePageProps = {
  searchParams: Promise<{ offer?: string | string[] }>;
};

export default async function TradePage({ searchParams }: TradePageProps) {
  const params = await searchParams;
  const raw = params.offer;
  const offerId = Array.isArray(raw) ? raw[0] : raw;

  return (
    <Suspense
      fallback={
        <main className="mw-card p-5">
          <p className="text-lg font-bold">Loading trade…</p>
        </main>
      }
    >
      <TradePageClient initialOfferId={offerId} />
    </Suspense>
  );
}
