"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

import { CraftingGrid } from "@/components/CraftingGrid";
import { getCraftingRecipeById } from "@/data/crafting";
import { getVocabularyIcon } from "@/lib/assets";
import { GameIcon } from "@/components/GameIcon";

type CraftingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function CraftingDetailPage({ params }: CraftingDetailPageProps) {
  const { id } = use(params);
  const recipe = getCraftingRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="space-y-6">
      <Link href="/crafting" className="text-sm font-bold text-primary">
        ← 返回合成查询
      </Link>

      <section className="mw-card p-6">
        <div className="flex items-center gap-3">
          <GameIcon
            src={getVocabularyIcon(recipe.resultWordId)}
            alt={recipe.resultEnglish}
            size="xl"
          />
          <div>
            <h1 className="text-3xl font-black">{recipe.resultEnglish}</h1>
            <p className="text-xl font-bold text-secondary">{recipe.resultChinese}</p>
          </div>
        </div>

        <CraftingGrid recipe={recipe} />

        <div className="mt-6 space-y-2">
          <p className="text-sm font-semibold">{recipe.simpleEnglish}</p>
          <p className="text-sm font-semibold text-muted">{recipe.simpleChinese}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-black">Key Words</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {recipe.keywordIds.map((wordId) => (
              <Link
                key={wordId}
                href={`/dictionary/${wordId}`}
                className="rounded-full bg-[#eef6e4] px-3 py-1 text-sm font-bold text-primary"
              >
                {wordId}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/dictionary/${recipe.resultWordId}`}
            className="mw-btn mw-btn-outline"
          >
            学单词 Learn Words
          </Link>
          {recipe.relatedGuideId ? (
            <Link href={`/guides/${recipe.relatedGuideId}`} className="mw-btn mw-btn-secondary">
              看攻略 Guide
            </Link>
          ) : null}
          {recipe.relatedQuestId ? (
            <Link href={`/quests/${recipe.relatedQuestId}`} className="mw-btn mw-btn-primary">
              开始任务 Start Quest
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
