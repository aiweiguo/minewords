"use client";

import { useState } from "react";

import { SpeakButton } from "@/components/SpeakButton";
import {
  getSpeakScenarioById,
  speakRoleLabels,
  speakScenarios,
} from "@/data/speakScenarios";
import {
  isSpeechRecognitionSupported,
  listenOnce,
  scoreSpeechAttempt,
} from "@/lib/speechRecognition";
import { useGameStore } from "@/store/useGameStore";
import { SpeakRole } from "@/types";

export default function SpeakPage() {
  const completeSpeakScenario = useGameStore((s) => s.completeSpeakScenario);
  const completedKeys = useGameStore((s) => s.completedBuildIdeaIds);

  const [roleFilter, setRoleFilter] = useState<SpeakRole | "all">("all");
  const [activeId, setActiveId] = useState(speakScenarios[0].id);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);

  const scenarios =
    roleFilter === "all"
      ? speakScenarios
      : speakScenarios.filter((s) => s.role === roleFilter);

  const scenario = getSpeakScenarioById(activeId) ?? speakScenarios[0];
  const roleMeta = speakRoleLabels[scenario.role];
  const completed = completedKeys.includes(`speak-${scenario.id}`);
  const supported = isSpeechRecognitionSupported();

  async function handleSpeak() {
    setListening(true);
    setResult(null);
    setPassed(null);
    try {
      const { transcript } = await listenOnce();
      setResult(transcript);
      const score = scoreSpeechAttempt(
        transcript,
        scenario.expectedText,
        scenario.keywords,
      );
      setPassed(score.passed);
      if (score.passed) {
        completeSpeakScenario(scenario.id, scenario.rewardXp);
      }
    } catch {
      setResult("没听清楚，再试一次吧。");
      setPassed(false);
    } finally {
      setListening(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Speaking Roleplay</h1>
        <p className="mt-1 text-xl font-bold">口语角色扮演</p>
        <p className="mt-2 text-sm font-semibold text-muted">
          和 Steve、Alex、村民用英语对话。点击麦克风说英文，匹配关键词即可过关。
        </p>
        {!supported ? (
          <p className="mt-3 rounded-xl bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">
            当前浏览器不支持语音识别，请用 Chrome 或 Edge 试试。
          </p>
        ) : null}
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
            onClick={() => {
              setActiveId(s.id);
              setResult(null);
              setPassed(null);
            }}
            className={`mw-card p-4 text-left ${
              activeId === s.id ? "ring-4 ring-primary" : ""
            }`}
          >
            <span className="text-2xl">{speakRoleLabels[s.role].emoji}</span>
            <p className="mt-2 font-black">{s.titleCn}</p>
            {completedKeys.includes(`speak-${s.id}`) ? (
              <span className="text-xs font-bold text-green-700">已完成</span>
            ) : null}
          </button>
        ))}
      </div>

      <section className="mw-card mw-reward-panel p-6">
        <p className="text-sm font-bold">
          {roleMeta.emoji} {roleMeta.nameCn}
        </p>
        <h2 className="mt-2 text-xl font-black">{scenario.titleCn}</h2>
        <p className="mt-4 rounded-xl bg-black/20 p-4 text-sm font-semibold">
          {scenario.npcLine}
          <br />
          <span className="text-muted">{scenario.npcLineCn}</span>
        </p>
        <p className="mt-4 text-sm font-bold text-primary">{scenario.hintCn}</p>
        <div className="mt-4">
          <SpeakButton text={scenario.expectedText} label="听示范 Listen" />
        </div>

        {supported ? (
          <button
            type="button"
            disabled={listening || completed}
            onClick={handleSpeak}
            className="mw-btn mw-btn-primary mt-6 w-full disabled:opacity-60"
          >
            {listening ? "正在听…" : completed ? "已完成 Completed" : "🎤 开始说话 Speak"}
          </button>
        ) : null}

        {result ? (
          <p
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${
              passed ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"
            }`}
          >
            {passed ? "Great! 说得太棒了！" : "Almost! 再试一次！"}
            <br />
            听到：{result}
          </p>
        ) : null}
      </section>
    </main>
  );
}
