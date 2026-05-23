"use client";

import Link from "next/link";

import { GameIcon } from "@/components/GameIcon";
import { getVocabularyIcon } from "@/lib/assets";
import { CraftingRecipe } from "@/types";

type CraftingGridProps = {
  recipe: CraftingRecipe;
  compact?: boolean;
};

export function CraftingGrid({ recipe, compact = false }: CraftingGridProps) {
  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      <div className="inline-block rounded-xl border-2 border-[#8B6914] bg-[#2a2418] p-3">
        {recipe.grid.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex gap-2">
            {row.map((cell, cellIndex) => (
              <div
                key={`cell-${rowIndex}-${cellIndex}`}
                className={`flex items-center justify-center rounded-lg border-2 border-[#5c4a1f] bg-[#1a1610] ${
                  compact ? "h-12 w-12" : "h-16 w-16 sm:h-20 sm:w-20"
                }`}
              >
                {cell ? (
                  <div className="text-center">
                    <GameIcon
                      src={getVocabularyIcon(cell.itemId)}
                      alt={cell.english}
                      size={compact ? "sm" : "md"}
                    />
                    {!compact ? (
                      <p className="mt-1 text-[9px] font-bold leading-tight text-white/80">
                        {cell.chinese}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-2xl font-black text-primary">=</span>
        <div className="mw-card flex items-center gap-3 px-4 py-3">
          <GameIcon
            src={getVocabularyIcon(recipe.resultWordId)}
            alt={recipe.resultEnglish}
            size="lg"
          />
          <div>
            <p className="text-lg font-black">{recipe.resultEnglish}</p>
            <p className="font-bold text-secondary">{recipe.resultChinese}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type CraftingRecipeCardProps = {
  recipe: CraftingRecipe;
};

export function CraftingRecipeCard({ recipe }: CraftingRecipeCardProps) {
  return (
    <Link href={`/crafting/${recipe.id}`} className="group block">
      <article className="mw-card p-4 transition-transform group-hover:-translate-y-0.5">
        <div className="flex items-center gap-3">
          <GameIcon
            src={getVocabularyIcon(recipe.resultWordId)}
            alt={recipe.resultEnglish}
            size="lg"
          />
          <div>
            <h3 className="text-lg font-black">{recipe.resultEnglish}</h3>
            <p className="font-bold text-secondary">{recipe.resultChinese}</p>
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-muted">{recipe.simpleChinese}</p>
      </article>
    </Link>
  );
}
