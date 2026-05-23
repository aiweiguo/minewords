"use client";

import { GameIcon } from "@/components/GameIcon";
import { getVocabularyIcon } from "@/lib/assets";
import { buildIdeaCategoryLabels } from "@/data/buildIdeas";
import { BuildIdea } from "@/types";

type BuildIdeaCardProps = {
  idea: BuildIdea;
  onClaim?: () => void;
  claimed?: boolean;
};

export function BuildIdeaCard({ idea, onClaim, claimed = false }: BuildIdeaCardProps) {
  const category = buildIdeaCategoryLabels[idea.category];
  const iconSrc = idea.icon ? getVocabularyIcon(idea.icon) : undefined;

  return (
    <article className="mw-card mw-reward-panel overflow-hidden p-5">
      <div className="flex items-start gap-3">
        {iconSrc ? <GameIcon src={iconSrc} alt={idea.title} size="lg" /> : null}
        <div>
          <span className="text-sm font-bold">
            {category.emoji} {category.cn}
          </span>
          <h3 className="mt-1 text-2xl font-black text-primary">{idea.title}</h3>
          <p className="text-lg font-bold text-secondary">{idea.titleCn}</p>
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold text-muted">{idea.descriptionCn}</p>

      <div className="mt-4">
        <h4 className="text-sm font-black">Materials 材料</h4>
        <ul className="mt-2 space-y-1 text-sm font-semibold">
          {idea.materials.map((m) => (
            <li key={`${m.english}-${m.chinese}`}>
              {m.english} — {m.chinese}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-black">Mission 任务</h4>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm font-semibold">
          {idea.missionEn.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {idea.keywords.map((kw) => (
          <span
            key={kw.wordId}
            className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary"
          >
            {kw.english} {kw.chinese}
          </span>
        ))}
      </div>

      {onClaim ? (
        <button
          type="button"
          onClick={onClaim}
          disabled={claimed}
          className="mw-btn mw-btn-primary mt-6 w-full disabled:opacity-60"
        >
          {claimed ? "已完成 Completed" : "接受挑战 Accept Challenge"}
        </button>
      ) : null}
    </article>
  );
}
