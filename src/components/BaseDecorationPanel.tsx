"use client";

import Link from "next/link";

import { baseDecorations, isDecorationUnlocked } from "@/data/baseDecorations";
import { useGameStore } from "@/store/useGameStore";

export function BaseDecorationPanel() {
  const learnedWordIds = useGameStore((s) => s.learnedWordIds);
  const masteredWordIds = useGameStore((s) => s.masteredWordIds);

  const unlocked = baseDecorations.filter((d) =>
    isDecorationUnlocked(d, learnedWordIds, masteredWordIds),
  );

  return (
    <section className="mw-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black">基地装饰 Base Decor</h2>
        <Link href="/minedex" className="text-sm font-bold text-primary">
          去图鉴 →
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted">学会单词，装饰你的英语基地！</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {baseDecorations.map((deco) => {
          const on = isDecorationUnlocked(deco, learnedWordIds, masteredWordIds);
          return (
            <div
              key={deco.id}
              className={`rounded-xl border-2 p-3 text-center ${
                on
                  ? "border-primary bg-primary/10"
                  : "border-[#d9e2cc] opacity-50 grayscale"
              }`}
            >
              <span className="text-3xl">{deco.emoji}</span>
              <p className="mt-2 text-xs font-bold">{deco.nameCn}</p>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-sm font-semibold">
        已点亮 {unlocked.length} / {baseDecorations.length} 件装饰
      </p>
    </section>
  );
}
