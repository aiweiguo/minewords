"use client";

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

export default function SpeakPage() {
  const completedSpeakIds = useGameStore((s) => s.completedSpeakIds);

  const [roleFilter, setRoleFilter] = useState<SpeakRole | "all">("all");
  const [activeId, setActiveId] = useState(speakScenarios[0].id);

  const scenarios =
    roleFilter === "all"
      ? speakScenarios
      : speakScenarios.filter((s) => s.role === roleFilter);

  const scenario = getSpeakScenarioById(activeId) ?? speakScenarios[0];
  const supported = isSpeechRecognitionSupported();

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Speaking Roleplay</h1>
        <p className="mt-1 text-xl font-bold">口语角色扮演</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          Steve 教生存、Alex 教建造、村民教交易。跟读句子，匹配关键词即可过关。
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
            onClick={() => setRoleFilter(role)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              roleFilter === role ? "bg-primary text-white" : "bg-white border-2 border-[#d9e2cc]"
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
