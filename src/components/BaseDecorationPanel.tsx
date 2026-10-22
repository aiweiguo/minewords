"use client";

import Link from "next/link";

import { baseDecorations, isDecorationUnlocked } from "@/data/baseDecorations";
import { backgroundMap } from "@/lib/assets";
import { useGameStore } from "@/store/useGameStore";

const sceneSlots = [
  { id: "slot-1", className: "top-[12%] left-[8%]" },
  { id: "slot-2", className: "top-[18%] right-[10%]" },
  { id: "slot-3", className: "top-[42%] left-[18%]" },
  { id: "slot-4", className: "top-[48%] right-[16%]" },
  { id: "slot-5", className: "bottom-[18%] left-[10%]" },
  { id: "slot-6", className: "bottom-[16%] right-[12%]" },
  { id: "slot-7", className: "bottom-[8%] left-[38%]" },
  { id: "slot-8", className: "top-[8%] left-[42%]" },
  { id: "slot-9", className: "top-[30%] left-[48%]" },
  { id: "slot-10", className: "bottom-[30%] right-[40%]" },
];

export function BaseDecorationPanel() {
  const learnedWordIds = useGameStore((s) => s.learnedWordIds);
  const masteredWordIds = useGameStore((s) => s.masteredWordIds);
  const unlockedIds = useGameStore((s) => s.unlockedIds);

  const unlockedDecorations = baseDecorations.filter(
    (deco) =>
      isDecorationUnlocked(deco, learnedWordIds, masteredWordIds) ||
      unlockedIds.includes(deco.id),
  );

  return (
    <section className="mw-card overflow-hidden p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black">基地装饰 Base Decor</h2>
        <Link href="/unlocks" className="text-sm font-bold text-primary">
          全部解锁 →
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted">学会单词，把你的英语基地装扮得更酷！</p>

      <div
        className="relative mt-4 min-h-[220px] overflow-hidden rounded-xl border-2 border-[#d9e2cc]"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(26,31,22,0.35), rgba(26,31,22,0.75)), url(${backgroundMap.base})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {baseDecorations.map((deco, index) => {
          const on =
            isDecorationUnlocked(deco, learnedWordIds, masteredWordIds) ||
            unlockedIds.includes(deco.id);
          const slot = sceneSlots[index % sceneSlots.length];
          return (
            <div
              key={deco.id}
              className={`absolute ${slot.className} flex flex-col items-center transition-all duration-500 ${
                on ? "mw-base-deco-unlocked scale-100 opacity-100" : "scale-75 opacity-30 grayscale"
              }`}
              title={deco.description}
            >
              <span className={`text-3xl ${on ? "mw-map-pulse" : ""}`}>{deco.emoji}</span>
              <span className="mt-1 rounded bg-black/50 px-1.5 text-[10px] font-bold">
                {deco.nameCn}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {baseDecorations.map((deco) => {
          const on =
            isDecorationUnlocked(deco, learnedWordIds, masteredWordIds) ||
            unlockedIds.includes(deco.id);
          const matched = deco.requiredWordIds.filter(
            (id) => learnedWordIds.includes(id) || masteredWordIds.includes(id),
          ).length;
          return (
            <div
              key={`${deco.id}-grid`}
              className={`rounded-xl border-2 p-3 text-center ${
                on
                  ? "border-primary bg-primary/10"
                  : "border-[#d9e2cc] opacity-70"
              }`}
            >
              <span className="text-2xl">{deco.emoji}</span>
              <p className="mt-2 text-xs font-bold">{deco.nameCn}</p>
              {!on ? (
                <p className="mt-1 text-[10px] text-muted">
                  {matched}/{deco.requiredCount} 词
                </p>
              ) : (
                <p className="mt-1 text-[10px] font-bold text-green-700">已点亮</p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-sm font-semibold">
        已点亮 {unlockedDecorations.length} / {baseDecorations.length} 件装饰
      </p>
    </section>
  );
}
