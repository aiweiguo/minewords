"use client";

import { useMemo, useState } from "react";

import { MineDexCard } from "@/components/MineDexCard";
import { vocabulary } from "@/data/vocabulary";
import { countMineDexByStatus, minedexCategoryLabels } from "@/lib/minedex";
import { useGameStore } from "@/store/useGameStore";
import { MineDexStatus, VocabularyCategory } from "@/types";

const categories: Array<VocabularyCategory | "all"> = [
  "all",
  "block",
  "tool",
  "weapon",
  "mob",
  "food",
  "ore",
  "crafting",
  "action",
  "biome",
];

const statusFilters: Array<MineDexStatus | "all"> = [
  "all",
  "undiscovered",
  "discovered",
  "learned",
  "mastered",
];

export default function MineDexPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<VocabularyCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<MineDexStatus | "all">("all");

  const discoveredWordIds = useGameStore((s) => s.discoveredWordIds);
  const learnedWordIds = useGameStore((s) => s.learnedWordIds);
  const masteredWordIds = useGameStore((s) => s.masteredWordIds);

  const counts = useMemo(
    () =>
      countMineDexByStatus(
        vocabulary,
        discoveredWordIds,
        learnedWordIds,
        masteredWordIds,
      ),
    [discoveredWordIds, learnedWordIds, masteredWordIds],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vocabulary.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      const status =
        masteredWordIds.includes(item.id)
          ? "mastered"
          : learnedWordIds.includes(item.id)
            ? "learned"
            : discoveredWordIds.includes(item.id)
              ? "discovered"
              : "undiscovered";
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [item.english, item.chinese, ...item.tags]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [
    query,
    category,
    statusFilter,
    discoveredWordIds,
    learnedWordIds,
    masteredWordIds,
  ]);

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">MineDex</h1>
        <p className="mt-1 text-xl font-bold">Minecraft 英语图鉴</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          收集单词，从「未发现」到「已掌握」！
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold sm:grid-cols-4">
          <p className="rounded-lg bg-gray-100 px-3 py-2">未发现 {counts.undiscovered}</p>
          <p className="rounded-lg bg-blue-100 px-3 py-2 text-blue-800">
            已发现 {counts.discovered}
          </p>
          <p className="rounded-lg bg-green-100 px-3 py-2 text-green-800">
            已学习 {counts.learned}
          </p>
          <p className="rounded-lg bg-amber-100 px-3 py-2 text-amber-900">
            已掌握 {counts.mastered}
          </p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 搜索 diamond / 钻石"
          className="mt-4 w-full rounded-xl border-2 border-[#d9e2cc] px-4 py-3 text-lg font-semibold outline-none focus:border-primary"
        />
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
            {item === "all" ? "全部" : (minedexCategoryLabels[item]?.cn ?? item)}
          </button>
        ))}
      </section>

      <section className="flex flex-wrap gap-2">
        {statusFilters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setStatusFilter(item)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              statusFilter === item
                ? "bg-secondary text-white"
                : "bg-white border-2 border-[#d9e2cc]"
            }`}
          >
            {item === "all" ? "全部状态" : item}
          </button>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {results.map((word) => (
          <MineDexCard
            key={word.id}
            word={word}
            discoveredWordIds={discoveredWordIds}
            learnedWordIds={learnedWordIds}
            masteredWordIds={masteredWordIds}
          />
        ))}
      </section>
    </main>
  );
}
