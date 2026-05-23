import Link from "next/link";

import { SpeakButton } from "@/components/SpeakButton";
import { VocabularyItem } from "@/types";

type WordCardProps = {
  word: VocabularyItem;
};

export function WordCard({ word }: WordCardProps) {
  return (
    <article className="mw-card flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-primary">{word.english}</h3>
          <p className="mt-1 text-lg font-bold">{word.chinese}</p>
          {word.phonetic ? (
            <p className="mt-1 text-sm text-muted">{word.phonetic}</p>
          ) : null}
        </div>
        <span className="rounded-full bg-[#eef6e4] px-3 py-1 text-xs font-bold uppercase text-primary">
          {word.category}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <SpeakButton text={word.english} className="!px-3 !py-2 text-sm" label="发音" />
        <Link href={`/dictionary/${word.id}`} className="mw-btn mw-btn-outline text-sm">
          详情
        </Link>
      </div>
    </article>
  );
}
