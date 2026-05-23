"use client";

import { useMemo, useState } from "react";

import { CraftingRecipeCard } from "@/components/CraftingGrid";
import { craftingRecipes, searchCraftingRecipes } from "@/data/crafting";

export default function CraftingPage() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchCraftingRecipes(query), [query]);

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Crafting Helper</h1>
        <p className="mt-1 text-xl font-bold">合成查询器</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          查床、火把、钻石剑怎么合成。输入中文也能搜，例如「床」「火把」
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 搜索 bed / 床 / torch..."
          className="mt-4 w-full rounded-xl border-2 border-[#d9e2cc] px-4 py-3 text-lg font-semibold outline-none focus:border-primary"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {results.map((recipe) => (
          <CraftingRecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </section>

      {results.length === 0 ? (
        <p className="text-center text-sm font-semibold text-muted">没有找到合成配方。</p>
      ) : null}

      <p className="text-center text-xs text-muted">共 {craftingRecipes.length} 个配方</p>
    </main>
  );
}
