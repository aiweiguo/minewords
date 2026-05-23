import Link from "next/link";

import { GameIcon } from "@/components/GameIcon";
import { RarityBadge } from "@/components/RarityBadge";
import { SpeakButton } from "@/components/SpeakButton";
import { getRarityClasses } from "@/lib/assets";
import { VocabularyItem } from "@/types";

type WordCardProps = {
  word: VocabularyItem;
};

export function WordCard({ word }: WordCardProps) {
  const rarity = word.rarity ?? "common";
  const rarityStyles = getRarityClasses(rarity);
  const iconSrc = word.icon ?? word.image;

  return (
    <Link href={`/dictionary/${word.id}`} className="group block h-full">
      <article
        className={`mw-card mw-rarity-${rarity} flex h-full flex-col overflow-hidden transition-transform group-hover:-translate-y-0.5 group-active:translate-y-0 ${rarityStyles.border} border-[3px] ring-2 ${rarityStyles.ring}`}
      >
        <div className="flex items-center gap-3 bg-black/20 p-4">
          {iconSrc ? (
            <GameIcon src={iconSrc} alt={word.english} size="lg" className="mw-rarity-glow" />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-black text-primary">{word.english}</h3>
              <RarityBadge rarity={rarity} compact />
            </div>
            <p className="mt-1 text-lg font-bold">{word.chinese}</p>
            {word.phonetic ? (
              <p className="mt-1 text-sm text-muted">{word.phonetic}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-4 pt-0">
          <span className="inline-flex w-fit rounded-md border border-[var(--panel-border)] bg-black/20 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-muted">
            {word.category}
          </span>

          <div className="mt-4 flex flex-wrap gap-2" onClick={(event) => event.preventDefault()}>
            <SpeakButton text={word.english} className="!px-3 !py-2 text-sm" label="发音" />
            <span className="mw-btn mw-btn-outline text-sm">详情 →</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
