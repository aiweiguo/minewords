"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CraftingRecipeCard } from "@/components/CraftingGrid";
import { WeaponGoalStrip } from "@/components/WeaponGoalStrip";
import { craftingRecipes, searchCraftingRecipes } from "@/data/crafting";
import { weaponTiers } from "@/data/weapons";
import { getWeaponGoalSnapshot } from "@/lib/weaponGoal";
import { useGameStore } from "@/store/useGameStore";

export default function CraftingPage() {
  const [query, setQuery] = useState("");
  const [practiceOpen, setPracticeOpen] = useState(false);
  const unlockedIds = useGameStore((s) => s.unlockedIds);
  const resources = useGameStore((s) => s.resources);
  const roomBlocks = useGameStore((s) => s.roomBlocks);
  const goal = getWeaponGoalSnapshot(unlockedIds, resources, roomBlocks);

  const results = useMemo(() => searchCraftingRecipes(query), [query]);
  const otherResults = results.filter(
    (recipe) => !weaponTiers.some((tier) => tier.id === recipe.id),
  );
  const searching = query.trim().length > 0;

  // Searching should reveal matches without an extra tap.
  useEffect(() => {
    if (searching) setPracticeOpen(true);
  }, [searching]);

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Crafting</h1>
        <p className="mt-1 text-xl font-bold">开口合成</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          木 → 石 → 铁 → 钻：开口合成升级武器。Enough mats? Speak to craft.
        </p>
      </section>

      <WeaponGoalStrip variant="settle" />

      <section className="space-y-3">
        <h2 className="px-1 text-lg font-black">武器线 Weapons</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {weaponTiers.map((tier) => {
            const owned = unlockedIds.includes(tier.id);
            const isGoal = goal.goal?.id === tier.id;
            return (
              <Link
                key={tier.id}
                href={`/crafting/${tier.id}`}
                className={`mw-card block p-4 ${
                  isGoal && goal.canCraft
                    ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/40"
                    : ""
                }`}
              >
                <p className="text-lg font-black">{tier.nameCn}</p>
                <p className="text-sm font-bold text-secondary">{tier.name}</p>
                <p className="mt-2 text-xs font-semibold text-muted">
                  {owned
                    ? "已拥有 Owned"
                    : isGoal
                      ? goal.canCraft
                        ? "可以合成 — 去开口"
                        : goal.stripCn
                      : "先完成上一把"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mw-card p-5">
        <h2 className="text-lg font-black">练习配方 Practice recipes</h2>
        <p className="mt-1 text-sm font-semibold text-muted">
          火把、床、镐等百科合成 — 主线不需要。查词用，不必空转。
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 搜索 bed / 床 / torch..."
          className="mw-craft-practice-search mt-4 w-full rounded-xl border-2 border-[#d9e2cc] px-4 py-3 text-lg font-semibold outline-none focus:border-primary"
        />

        <div className="mw-craft-practice mt-4">
          <button
            type="button"
            aria-expanded={practiceOpen}
            onClick={() => setPracticeOpen((open) => !open)}
            className="mw-craft-practice-toggle"
          >
            <span>
              练习 · {otherResults.length}
              {searching ? " 个匹配" : " 个配方"}
            </span>
            <span className="text-lg font-black text-primary" aria-hidden>
              {practiceOpen ? "−" : "+"}
            </span>
          </button>

          {practiceOpen ? (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {otherResults.map((recipe) => (
                <CraftingRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  practice
                />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs font-semibold text-muted">
              默认收起 — 点开可查百科配方；武器目标在上面。
            </p>
          )}
        </div>
      </section>

      {practiceOpen && otherResults.length === 0 && searching ? (
        <p className="text-center text-sm font-semibold text-muted">
          没有找到合成配方。
        </p>
      ) : null}

      <p className="text-center text-xs text-muted">
        武器线 {weaponTiers.length} · 练习{" "}
        {craftingRecipes.length - weaponTiers.length} · 共{" "}
        {craftingRecipes.length} 个配方
      </p>
    </main>
  );
}
