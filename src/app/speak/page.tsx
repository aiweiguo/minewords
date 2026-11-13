"use client";

import Link from "next/link";
import { useState } from "react";

import { SpeakScenarioRunner } from "@/components/SpeakScenarioRunner";
import { sentencePatterns } from "@/data/sentencePatterns";
import {
  getSpeakScenarioById,
  speakRoleLabels,
  speakScenarios,
} from "@/data/speakScenarios";
import { isSpeechRecognitionSupported } from "@/lib/speechRecognition";
import { useGameStore } from "@/store/useGameStore";
import { SpeakRole } from "@/types";

/**
 * Post-iron sentence practice (P2-2 / MW-48).
 * Not a parallel kid speech island — hub CTA stays fight/craft/explore.
 */
export default function SpeakPage() {
  const completedSpeakIds = useGameStore((s) => s.completedSpeakIds);
  const unlockedIds = useGameStore((s) => s.unlockedIds);
  const hasIronSword = unlockedIds.includes("iron-sword");

  const [roleFilter, setRoleFilter] = useState<SpeakRole | "all">("all");
  const [activeId, setActiveId] = useState(speakScenarios[0].id);

  const scenarios =
    roleFilter === "all"
      ? speakScenarios
      : speakScenarios.filter((s) => s.role === roleFilter);

  const scenario = getSpeakScenarioById(activeId) ?? scenarios[0] ?? speakScenarios[0];
  const supported = isSpeechRecognitionSupported();

  function handleRoleFilter(role: SpeakRole | "all") {
    setRoleFilter(role);
    const next =
      role === "all"
        ? speakScenarios
        : speakScenarios.filter((s) => s.role === role);
    setActiveId(next[0]?.id ?? speakScenarios[0].id);
  }

  if (!hasIronSword) {
    return (
      <main className="space-y-6">
        <section className="mw-card p-5">
          <h1 className="text-3xl font-black text-primary">Sentence Gym</h1>
          <p className="mt-1 text-xl font-bold">句子训练场</p>
          <p className="mt-2 text-sm font-semibold text-muted">
            这是铁剑之后的加练：先去打怪、合成、出门探险。开口打怪才是主玩法。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/explore" className="mw-btn mw-btn-primary">
              出门打怪
            </Link>
            <Link href="/crafting" className="mw-btn mw-btn-outline">
              去合成
            </Link>
            <Link href="/" className="mw-btn mw-btn-outline">
              回基地
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">
          铁后加练 · 不抢主环
        </p>
        <h1 className="mt-1 text-3xl font-black text-primary">Sentence Gym</h1>
        <p className="mt-1 text-xl font-bold">句子训练场</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          已经有铁剑了？在这里跟读更长的句子。日常开口仍在打怪、合成、交易里。
        </p>
        {!supported ? (
          <p className="mt-3 rounded-xl bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">
            当前浏览器不支持语音识别，请用 Chrome 或 Edge 试试。
          </p>
        ) : null}
      </section>

      <section className="mw-card p-5">
        <h2 className="text-lg font-black">句型库 Sentence Patterns</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {sentencePatterns.map((pattern) => (
            <article key={pattern.id} className="rounded-xl bg-black/20 p-4">
              <p className="font-black text-primary">{pattern.patternEn}</p>
              <p className="text-sm font-bold text-muted">{pattern.patternCn}</p>
              <p className="mt-2 text-sm">{pattern.examples[0]?.english}</p>
              <p className="text-xs text-muted">{pattern.examples[0]?.chinese}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {(["all", "steve", "alex", "villager"] as const).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => handleRoleFilter(role)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              roleFilter === role
                ? "bg-primary text-white"
                : "border-2 border-[#8B6914]/50 bg-black/20"
            }`}
          >
            {role === "all" ? "全部" : speakRoleLabels[role].nameCn}
          </button>
        ))}
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveId(s.id)}
            className={`mw-card p-4 text-left ${
              activeId === s.id ? "ring-4 ring-primary" : ""
            }`}
          >
            <span className="text-2xl">{speakRoleLabels[s.role].emoji}</span>
            <p className="mt-2 font-black">{s.titleCn}</p>
            {completedSpeakIds.includes(s.id) ? (
              <span className="text-xs font-bold text-green-700">已完成</span>
            ) : null}
          </button>
        ))}
      </div>

      <SpeakScenarioRunner key={scenario.id} scenario={scenario} />
    </main>
  );
}
