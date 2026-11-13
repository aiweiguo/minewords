"use client";

import Link from "next/link";
import { useState } from "react";

import { decorationSceneSlots } from "@/data/decorationSlots";
import { baseDecorations, isDecorationUnlocked } from "@/data/baseDecorations";
import { backgroundMap } from "@/lib/assets";
import { useGameStore } from "@/store/useGameStore";

type BaseDecorationPanelProps = {
  /** Collapsible unlock list for hub; full scenic card elsewhere. */
  variant?: "full" | "hub";
  /** Controlled open state for hub variant (e.g. `/#decorate`). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function BaseDecorationPanel({
  variant = "full",
  open,
  onOpenChange,
}: BaseDecorationPanelProps) {
  const learnedWordIds = useGameStore((s) => s.learnedWordIds);
  const masteredWordIds = useGameStore((s) => s.masteredWordIds);
  const unlockedIds = useGameStore((s) => s.unlockedIds);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const hubOpen = open ?? uncontrolledOpen;
  const setHubOpen = onOpenChange ?? setUncontrolledOpen;

  const unlockedDecorations = baseDecorations.filter(
    (deco) =>
      isDecorationUnlocked(deco, learnedWordIds, masteredWordIds) ||
      unlockedIds.includes(deco.id),
  );

  function isOn(decoId: string) {
    const deco = baseDecorations.find((item) => item.id === decoId);
    if (!deco) return false;
    return (
      isDecorationUnlocked(deco, learnedWordIds, masteredWordIds) ||
      unlockedIds.includes(deco.id)
    );
  }

  if (variant === "hub") {
    return (
      <section id="decorate" className="mw-hub-decorate scroll-mt-4">
        <button
          type="button"
          aria-expanded={hubOpen}
          onClick={() => setHubOpen(!hubOpen)}
          className="mw-hub-decorate-toggle"
        >
          <div className="min-w-0 text-left">
            <h2 className="text-base font-black">装扮基地</h2>
            <p className="truncate text-xs font-semibold text-muted">
              已点亮 {unlockedDecorations.length} / {baseDecorations.length} ·
              学词解锁，家里看得见
            </p>
          </div>
          <span className="text-lg font-black text-primary" aria-hidden>
            {hubOpen ? "−" : "+"}
          </span>
        </button>

        {hubOpen ? (
          <div className="mw-hub-decorate-body">
            <p className="text-sm font-semibold text-muted">
              已解锁的装饰会出现在上面房间里。继续开口学词，点亮更多！
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {baseDecorations.map((deco) => {
                const on = isOn(deco.id);
                const matched = deco.requiredWordIds.filter(
                  (id) =>
                    learnedWordIds.includes(id) || masteredWordIds.includes(id),
                ).length;
                return (
                  <div
                    key={deco.id}
                    className={`mw-hub-decorate-chip ${on ? "on" : ""}`}
                    title={deco.description}
                  >
                    <span className="text-xl" aria-hidden>
                      {deco.emoji}
                    </span>
                    <p className="mt-1 text-[11px] font-bold leading-tight">
                      {deco.nameCn}
                    </p>
                    {!on ? (
                      <p className="mt-0.5 text-[10px] text-muted">
                        {matched}/{deco.requiredCount} 词
                      </p>
                    ) : (
                      <p className="mt-0.5 text-[10px] font-bold text-green-800">
                        已点亮
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <Link
              href="/unlocks"
              className="mt-3 inline-block text-sm font-bold text-primary"
            >
              全部解锁 →
            </Link>
          </div>
        ) : null}
      </section>
    );
  }

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
          const on = isOn(deco.id);
          const slot = decorationSceneSlots[index % decorationSceneSlots.length];
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
          const on = isOn(deco.id);
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
