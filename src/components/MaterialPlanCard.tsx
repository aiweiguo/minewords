"use client";

import Link from "next/link";

import { GameIcon } from "@/components/GameIcon";
import { getVocabularyIcon } from "@/lib/assets";
import { MaterialPlan } from "@/types";

type MaterialPlanCardProps = {
  plan: MaterialPlan;
  showActions?: boolean;
};

export function MaterialPlanCard({ plan, showActions = true }: MaterialPlanCardProps) {
  return (
    <section className="mw-card mw-reward-panel p-6">
      <h2 className="text-2xl font-black">{plan.title}</h2>
      <p className="font-bold text-secondary">{plan.titleCn}</p>
      <p className="mt-3 text-sm font-semibold">{plan.descriptionCn}</p>
      <p className="mt-2 text-sm font-semibold text-muted">{plan.simpleEnglish}</p>

      <h3 className="mt-6 text-lg font-black">你需要 You need:</h3>
      <ul className="mt-4 space-y-3">
        {plan.items.map((item) => (
          <li
            key={item.itemId}
            className="flex items-center gap-3 rounded-xl bg-black/20 px-4 py-3 font-bold"
          >
            <GameIcon src={getVocabularyIcon(item.itemId)} alt={item.english} size="md" />
            <span>
              {item.english} {item.chinese} ×{item.amount}
            </span>
          </li>
        ))}
      </ul>

      {showActions ? (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {plan.keywordIds.map((wordId) => (
              <Link
                key={wordId}
                href={`/dictionary/${wordId}`}
                className="rounded-full bg-primary/15 px-3 py-1 text-sm font-bold text-primary"
              >
                {wordId}
              </Link>
            ))}
          </div>

          <Link href="/crafting" className="mw-btn mw-btn-primary mt-6 inline-flex">
            查看合成表 →
          </Link>
        </>
      ) : null}
    </section>
  );
}
