"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { GameIcon } from "@/components/GameIcon";
import { materialPlans, scaleMaterialPlan } from "@/data/materialPlans";
import { getVocabularyIcon } from "@/lib/assets";

export default function PlannerPage() {
  const [selectedId, setSelectedId] = useState(materialPlans[0].id);
  const [multiplier, setMultiplier] = useState(1);

  const basePlan = materialPlans.find((p) => p.id === selectedId) ?? materialPlans[0];
  const plan = useMemo(
    () => (multiplier > 1 ? scaleMaterialPlan(basePlan, multiplier) : basePlan),
    [basePlan, multiplier],
  );

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Material Planner</h1>
        <p className="mt-1 text-xl font-bold">材料规划器</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          输入想做的数量，算算需要多少材料。例如：3 把钻石剑
        </p>
      </section>

      <section className="mw-card p-5">
        <label className="text-sm font-black">选择计划</label>
        <select
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setMultiplier(1);
          }}
          className="mt-2 w-full rounded-xl border-2 border-[#d9e2cc] px-4 py-3 font-bold"
        >
          {materialPlans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.titleCn} / {p.title}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-sm font-black">数量倍数</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 2, 3, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setMultiplier(n)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                multiplier === n ? "bg-primary text-white" : "bg-white border-2 border-[#d9e2cc]"
              }`}
            >
              ×{n}
            </button>
          ))}
        </div>
      </section>

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
      </section>
    </main>
  );
}
