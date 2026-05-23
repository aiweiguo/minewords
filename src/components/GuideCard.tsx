import Link from "next/link";

import { guideCategoryLabels } from "@/data/guides";
import { Guide } from "@/types";

type GuideCardProps = {
  guide: Guide;
  completed?: boolean;
};

export function GuideCard({ guide, completed = false }: GuideCardProps) {
  const label = guideCategoryLabels[guide.category];

  return (
    <Link href={`/guides/${guide.id}`} className="group block">
      <article className="mw-card overflow-hidden transition-transform group-hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3 bg-black/20 p-4">
          <div>
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-black uppercase text-primary">
              {label.cn}
            </span>
            <h3 className="mt-2 text-lg font-black">{guide.title}</h3>
            <p className="text-base font-bold text-secondary">{guide.titleCn}</p>
          </div>
          {completed ? (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-800">
              已学
            </span>
          ) : (
            <span className="text-lg">{"★".repeat(guide.difficulty)}</span>
          )}
        </div>
        <p className="line-clamp-2 px-4 pb-4 text-sm text-muted">{guide.summaryCn}</p>
      </article>
    </Link>
  );
}
