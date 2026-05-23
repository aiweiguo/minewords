"use client";

import { useState } from "react";

import { BuildIdeaCard } from "@/components/BuildIdeaCard";
import {
  buildIdeaCategoryLabels,
  getRandomBuildIdea,
} from "@/data/buildIdeas";
import { useGameStore } from "@/store/useGameStore";
import { BuildIdea, BuildIdeaCategory } from "@/types";

const categories: Array<BuildIdeaCategory | "all"> = [
  "all",
  "house",
  "farm",
  "redstone",
  "adventure",
  "decoration",
];

export default function CreatePage() {
  const [category, setCategory] = useState<BuildIdeaCategory | "all">("all");
  const [idea, setIdea] = useState<BuildIdea>(() => getRandomBuildIdea());
  const [claimed, setClaimed] = useState(false);

  const claimBuildIdea = useGameStore((s) => s.claimBuildIdea);
  const completedBuildIdeaIds = useGameStore((s) => s.completedBuildIdeaIds);

  function handleGenerate() {
    const next = getRandomBuildIdea(category);
    setIdea(next);
    setClaimed(completedBuildIdeaIds.includes(next.id));
  }

  function handleClaim() {
    const ok = claimBuildIdea(idea.id);
    if (ok) setClaimed(true);
  }

  const alreadyClaimed = claimed || completedBuildIdeaIds.includes(idea.id);

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Build Ideas</h1>
        <p className="mt-1 text-xl font-bold">创意生成器</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          不知道今天造什么？随机生成建造挑战，顺便学英文！
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
            {item === "all"
              ? "全部"
              : `${buildIdeaCategoryLabels[item].emoji} ${buildIdeaCategoryLabels[item].cn}`}
          </button>
        ))}
      </section>

      <BuildIdeaCard idea={idea} onClaim={handleClaim} claimed={alreadyClaimed} />

      <div className="text-center">
        <button type="button" onClick={handleGenerate} className="mw-btn mw-btn-accent">
          Generate New Idea 生成新创意
        </button>
      </div>
    </main>
  );
}
