import Link from "next/link";

import { GameIcon } from "@/components/GameIcon";
import { RarityBadge } from "@/components/RarityBadge";
import { getVocabularyIcon } from "@/lib/assets";
import {
  getMineDexStatus,
  minedexStatusLabels,
} from "@/lib/minedex";
import { VocabularyItem } from "@/types";

type MineDexCardProps = {
  word: VocabularyItem;
  discoveredWordIds: string[];
  learnedWordIds: string[];
  masteredWordIds: string[];
};

export function MineDexCard({
  word,
  discoveredWordIds,
  learnedWordIds,
  masteredWordIds,
}: MineDexCardProps) {
  const status = getMineDexStatus(
    word.id,
    discoveredWordIds,
    learnedWordIds,
    masteredWordIds,
  );
  const statusMeta = minedexStatusLabels[status];
  const iconSrc = word.icon ?? getVocabularyIcon(word.id);
  const hidden = status === "undiscovered";

  return (
    <Link href={`/dictionary/${word.id}`} className="group block h-full">
      <article
        className={`mw-card flex h-full flex-col overflow-hidden transition-transform group-hover:-translate-y-0.5 ${
          hidden ? "opacity-70" : ""
        }`}
      >
        <div className="flex items-center gap-3 p-4">
          <GameIcon
            src={iconSrc}
            alt={hidden ? "???" : word.english}
            size="lg"
            className={hidden ? "opacity-40 grayscale" : ""}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black">
                {hidden ? "???" : word.english}
              </h3>
              {word.rarity ? <RarityBadge rarity={word.rarity} compact /> : null}
            </div>
            <p className="font-bold">{hidden ? "未发现" : word.chinese}</p>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${statusMeta.color}`}
            >
              {statusMeta.cn}
            </span>
          </div>
        </div>
        {!hidden && word.phonetic ? (
          <p className="px-4 pb-4 text-sm text-muted">{word.phonetic}</p>
        ) : null}
      </article>
    </Link>
  );
}
