"use client";

import { FormEvent, useMemo, useState } from "react";

import { MaterialPlanCard } from "@/components/MaterialPlanCard";
import { materialPlans, scaleMaterialPlan } from "@/data/materialPlans";
import { parsePlannerQuery } from "@/lib/plannerParser";

export default function PlannerPage() {
  const [selectedId, setSelectedId] = useState(materialPlans[0].id);
  const [multiplier, setMultiplier] = useState(1);
  const [query, setQuery] = useState("");
  const [queryMessage, setQueryMessage] = useState<string | null>(null);

  const basePlan = materialPlans.find((p) => p.id === selectedId) ?? materialPlans[0];
  const plan = useMemo(
    () => (multiplier > 1 ? scaleMaterialPlan(basePlan, multiplier) : basePlan),
    [basePlan, multiplier],
  );

  function handleNaturalLanguageSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = parsePlannerQuery(query);
    if (!parsed.ok) {
      setQueryMessage(parsed.error);
      return;
    }

    setSelectedId(parsed.planId);
    setMultiplier(parsed.multiplier);
    setQueryMessage(`已识别：${parsed.matchedText}`);
  }

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Material Planner</h1>
        <p className="mt-1 text-xl font-bold">材料规划器</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          用中文或英文描述你想做的东西，例如：「3 把钻石剑」「建一个小房子」
        </p>
      </section>

      <section className="mw-card p-5">
        <form onSubmit={handleNaturalLanguageSubmit} className="space-y-3">
          <label className="text-sm font-black">自然语言输入</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例如：我想做 3 把钻石剑"
              className="flex-1 rounded-xl border-2 border-[#d9e2cc] px-4 py-3 font-semibold"
            />
            <button type="submit" className="mw-btn mw-btn-primary">
              计算 Calculate
            </button>
          </div>
          {queryMessage ? (
            <p className="text-sm font-bold text-primary">{queryMessage}</p>
          ) : null}
          <p className="text-xs text-muted">
            支持：钻石剑、火把、小房子、铁镐、床，以及 ×2 / ×3 数量
          </p>
        </form>
      </section>

      <section className="mw-card p-5">
        <label className="text-sm font-black">或手动选择计划</label>
        <select
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setMultiplier(1);
            setQueryMessage(null);
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

      <MaterialPlanCard plan={plan} />
    </main>
  );
}
