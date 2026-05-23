"use client";

import { useMemo, useState } from "react";

import { SpeakButton } from "@/components/SpeakButton";
import { getSentencePatternForKeywords } from "@/data/sentencePatterns";
import { speakRoleLabels } from "@/data/speakScenarios";
import {
  isSpeechRecognitionSupported,
  listenOnce,
  scoreSpeechAttempt,
} from "@/lib/speechRecognition";
import { useGameStore } from "@/store/useGameStore";
import { SpeakScenario } from "@/types";

type SpeakScenarioRunnerProps = {
  scenario: SpeakScenario;
};

const roleStyles = {
  steve: "from-green-900/40 to-green-700/20 border-green-500/40",
  alex: "from-orange-900/40 to-orange-700/20 border-orange-500/40",
  villager: "from-amber-900/40 to-amber-700/20 border-amber-500/40",
} as const;

export function SpeakScenarioRunner({ scenario }: SpeakScenarioRunnerProps) {
  const completeSpeakScenario = useGameStore((s) => s.completeSpeakScenario);
  const recordSpeakAttempt = useGameStore((s) => s.recordSpeakAttempt);
  const completedSpeakIds = useGameStore((s) => s.completedSpeakIds);

  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);

  const roleMeta = speakRoleLabels[scenario.role];
  const completed = completedSpeakIds.includes(scenario.id);
  const supported = isSpeechRecognitionSupported();
  const sentencePattern = useMemo(
    () => getSentencePatternForKeywords(scenario.keywords),
    [scenario.keywords],
  );

  async function handleSpeak() {
    setListening(true);
    setResult(null);
    setPassed(null);
    recordSpeakAttempt();

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
    <section
      className={`mw-card mw-reward-panel overflow-hidden border-2 bg-gradient-to-br p-6 ${roleStyles[scenario.role]}`}
    >
      <p className="text-sm font-bold">
        {roleMeta.emoji} {roleMeta.nameCn}
      </p>
      <h2 className="mt-2 text-xl font-black">{scenario.titleCn}</h2>
      <p className="mt-1 text-sm font-semibold text-muted">{scenario.title}</p>

      <p className="mt-4 rounded-xl bg-black/25 p-4 text-sm font-semibold">
        <span className="font-black text-primary">NPC:</span> {scenario.npcLine}
        <br />
        <span className="text-muted">{scenario.npcLineCn}</span>
      </p>

      {sentencePattern ? (
        <div className="mt-4 rounded-xl bg-primary/10 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-primary">
            句型 Sentence Pattern
          </p>
          <p className="mt-1 font-black">{sentencePattern.patternEn}</p>
          <p className="text-sm font-bold text-muted">{sentencePattern.patternCn}</p>
          <p className="mt-2 text-sm font-semibold">
            {sentencePattern.examples[0]?.english}
            <br />
            <span className="text-muted">{sentencePattern.examples[0]?.chinese}</span>
          </p>
        </div>
      ) : null}

      <p className="mt-4 text-sm font-bold text-primary">{scenario.hintCn}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <SpeakButton text={scenario.expectedText} label="听示范 Listen" />
        {scenario.keywords.map((keyword) => (
          <span
            key={keyword}
            className="rounded-full bg-black/20 px-3 py-1 text-xs font-bold"
          >
            {keyword}
          </span>
        ))}
      </div>

      {supported ? (
        <button
          type="button"
          disabled={listening || completed}
          onClick={handleSpeak}
          className="mw-btn mw-btn-primary mt-6 w-full disabled:opacity-60"
        >
          {listening ? "正在听…" : completed ? "已完成 Completed ✓" : "🎤 开始说话 Speak"}
        </button>
      ) : (
        <button
          type="button"
          disabled={completed}
          onClick={() => {
            recordSpeakAttempt();
            completeSpeakScenario(scenario.id, scenario.rewardXp);
            setPassed(true);
            setResult("手动确认：我已跟读完成。");
          }}
          className="mw-btn mw-btn-secondary mt-6 w-full disabled:opacity-60"
        >
          我已跟读 I said it
        </button>
      )}

      {result ? (
        <p
          className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${
            passed ? "bg-green-900/40 text-green-200" : "bg-amber-900/40 text-amber-100"
          }`}
        >
          {passed ? "Great! 说得太棒了！" : "Almost! 再试一次！"}
          <br />
          听到：{result}
        </p>
      ) : null}
    </section>
  );
}
