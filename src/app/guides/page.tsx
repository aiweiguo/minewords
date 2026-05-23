"use client";

import { useMemo, useState } from "react";

import { GuideCard } from "@/components/GuideCard";
import { guideCategoryLabels, guides, searchGuides } from "@/data/guides";
import { useGameStore } from "@/store/useGameStore";
import { GuideCategory } from "@/types";

const categories: Array<GuideCategory | "all"> = [
  "all",
  "survival",
  "tools",
  "mobs",
  "exploration",
  "crafting",
  "redstone",
];

export default function GuidesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GuideCategory | "all">("all");
  const completedGuideIds = useGameStore((s) => s.completedGuideIds);

  const results = useMemo(
    () => searchGuides(query, category),
    [query, category],
  );

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Ask Minecraft</h1>
        <p className="mt-1 text-xl font-bold">问 Minecraft · 攻略库</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          查攻略、学关键词、做小测验。输入中文也能搜，例如「怎么做钻石剑」
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 搜索..."
          className="mt-4 w-full rounded-xl border-2 border-[#d9e2cc] px-4 py-3 text-lg font-semibold outline-none focus:border-primary"
        />
        <p className="mt-2 text-xs font-semibold text-muted">
          共 {guides.length} 篇攻略
        </p>
      </section>

      <section className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              category === item ? "bg-primary text-white" : "bg-white border-2 border-[#d9e2cc]"
            }`}
          >
            {item === "all" ? "全部" : guideCategoryLabels[item].cn}
          </button>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {results.map((guide) => (
          <GuideCard
            key={guide.id}
            guide={guide}
            completed={completedGuideIds.includes(guide.id)}
          />
        ))}
      </section>
    </main>
  );
}
