"use client";

import { useMemo, useState } from "react";

import { WordCard } from "@/components/WordCard";
import { vocabulary } from "@/data/vocabulary";
import { searchVocabulary } from "@/lib/search";
import { VocabularyCategory } from "@/types";

const categories: Array<VocabularyCategory | "all"> = [
  "all",
  "block",
  "tool",
  "weapon",
  "mob",
  "food",
  "ore",
  "action",
  "crafting",
  "biome",
];

export default function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<VocabularyCategory | "all">("all");

  const results = useMemo(
    () => searchVocabulary(vocabulary, query, category),
    [query, category],
  );

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Dictionary 单词词典</h1>
        <p className="mt-2 text-sm font-semibold text-muted">
          搜索英文、中文或标签，例如 diamond / 钻石
        </p>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search 搜索..."
          className="mt-4 w-full rounded-xl border-2 border-[#d9e2cc] px-4 py-3 text-lg font-semibold outline-none focus:border-primary"
        />
      </section>

      <section className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              category === item
                ? "bg-primary text-white"
                : "bg-white text-muted border-2 border-[#d9e2cc]"
            }`}
          >
            {item}
          </button>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {results.map((word) => (
          <WordCard key={word.id} word={word} />
        ))}
      </section>

      {results.length === 0 ? (
        <p className="text-center text-sm font-semibold text-muted">没有找到相关单词。</p>
      ) : null}
    </main>
  );
}
