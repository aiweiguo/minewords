"use client";

import { useEffect, useState } from "react";

import { FollowConfirmControls } from "@/components/FollowConfirmControls";
import { SpeakButton } from "@/components/SpeakButton";
import {
  VILLAGER_CHAT_STORAGE_KEY,
  getVillagerChatTurn,
  villagerChatTurnCount,
  villagerChatTurns,
} from "@/data/villagerChat";
import { useFollowConfirmRitual } from "@/hooks/useFollowConfirmRitual";
import {
  isSpeechRecognitionSupported,
  listenOnce,
  scoreTradeSpeechAttempt,
} from "@/lib/speechRecognition";
import { useGameStore } from "@/store/useGameStore";

function readCompletedTurns(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VILLAGER_CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

function writeCompletedTurns(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VILLAGER_CHAT_STORAGE_KEY, JSON.stringify(ids));
}

/**
 * Hub villager deep-chat: 2–3 speak-trade turns, then hand off to offers.
 * Front door stays Hub → /trade (not standalone /speak).
 */
export function VillagerDeepChat() {
  const markWordsLearned = useGameStore((s) => s.markWordsLearned);
  const recordSpeakAttempt = useGameStore((s) => s.recordSpeakAttempt);
  const recordSpeakCompletion = useGameStore((s) => s.recordSpeakCompletion);
  const recordConfirmCompletion = useGameStore((s) => s.recordConfirmCompletion);

  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [supported, setSupported] = useState(false);

  const stepIndex = villagerChatTurns.findIndex(
    (turn) => !completedIds.includes(turn.id),
  );
  const done = hydrated && stepIndex < 0;
  const turn = done ? undefined : getVillagerChatTurn(Math.max(0, stepIndex));
  const follow = useFollowConfirmRitual(turn?.expectedSpeech ?? "");

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
    const saved = readCompletedTurns();
    setCompletedIds(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    setListening(false);
    setResult(null);
    setPassed(null);
  }, [turn?.id]);

  function finishTurn(turnId: string, wordIds: string[]) {
    markWordsLearned(wordIds);
    const next = completedIds.includes(turnId)
      ? completedIds
      : [...completedIds, turnId];
    setCompletedIds(next);
    writeCompletedTurns(next);
    setPassed(true);
  }

  async function handleSpeak() {
    if (!turn) return;
    setListening(true);
    setResult(null);
    setPassed(null);
    recordSpeakAttempt();

    try {
      const { transcript } = await listenOnce();
      setResult(transcript);
      const score = scoreTradeSpeechAttempt(
        transcript,
        turn.expectedSpeech,
        turn.speechKeywords,
      );
      setPassed(score.passed);
      if (score.passed) {
        recordSpeakCompletion();
        finishTurn(turn.id, turn.wordIds);
      }
    } catch {
      setResult("没听清楚，再试一次吧。");
      setPassed(false);
    } finally {
      setListening(false);
    }
  }

  function handleManualConfirm() {
    if (!turn) return;
    if (follow.softPath && !follow.canConfirm) return;
    recordSpeakAttempt();
    recordConfirmCompletion();
    setResult(
      follow.softPath
        ? "跟读确认：我和村民说过话了。"
        : "手动确认：我和村民说过话了。",
    );
    finishTurn(turn.id, turn.wordIds);
  }

  if (!hydrated) {
    return (
      <section className="mw-card p-5">
        <p className="text-sm font-bold text-muted">村民正在摆摊…</p>
      </section>
    );
  }

  if (done) {
    return (
      <section className="mw-card space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-amber-100/80">
              Villager 村民
            </p>
            <p className="text-sm font-bold text-green-200">
              聊完了 — 选下面报价开口交易
            </p>
          </div>
          <button
            type="button"
            className="mw-btn mw-btn-outline text-xs"
            onClick={() => {
              writeCompletedTurns([]);
              setCompletedIds([]);
              setPassed(null);
              setResult(null);
            }}
          >
            再聊一次
          </button>
        </div>
      </section>
    );
  }

  if (!turn) return null;

  return (
    <section className="mw-card space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-amber-100/80">
            Villager 深聊 · {stepIndex + 1}/{villagerChatTurnCount()}
          </p>
          <h2 className="mt-1 text-xl font-black">和村民聊聊</h2>
          <p className="text-sm font-semibold text-muted">
            开口几轮（含农场词），再挑报价交易 — Speak-trade, not a quiz island.
          </p>
        </div>
        <span className="mw-hub-villager" aria-hidden>
          <span className="mw-hub-villager-head" />
          <span className="mw-hub-villager-body" />
        </span>
      </div>

      <div className="rounded-xl border border-amber-500/25 bg-amber-950/25 px-4 py-3">
        <p className="text-base font-bold">{turn.npcLine}</p>
        <p className="text-sm font-semibold text-muted">{turn.npcLineCn}</p>
      </div>

      <div className="rounded-xl bg-black/15 p-4">
        <p className="text-sm font-black uppercase tracking-wide text-primary">
          开口说话 Speak
        </p>
        <p className="mt-2 text-xl font-black">{turn.expectedSpeech}</p>
        <p className="mt-1 text-sm font-semibold">{turn.speechHintCn}</p>
        <p className="text-sm text-muted">{turn.speechHintEn}</p>
        <div className="mt-3">
          <SpeakButton text={turn.expectedSpeech} label="听示范 Listen" />
        </div>
      </div>

      <div className="space-y-2">
        {supported ? (
          <button
            type="button"
            disabled={listening}
            onClick={() => {
              void handleSpeak();
            }}
            className="mw-btn mw-btn-secondary w-full disabled:opacity-60"
          >
            {listening ? "正在听… Listening…" : "🎤 开口回答 Speak"}
          </button>
        ) : null}
        <FollowConfirmControls
          softPath={follow.softPath}
          phase={follow.phase}
          secondsLeft={follow.secondsLeft}
          canConfirm={follow.canConfirm}
          ritualBusy={follow.ritualBusy}
          disabled={listening}
          confirmLabel="我说出了这句话 I said it"
          onStartRitual={() => {
            void follow.startRitual();
          }}
          onConfirm={handleManualConfirm}
          confirmClassName={supported ? "mw-btn-outline" : "mw-btn-secondary"}
        />
      </div>

      {result ? (
        <p
          className={`rounded-xl px-4 py-3 text-sm font-bold ${
            passed
              ? "bg-green-900/40 text-green-200"
              : "bg-amber-900/40 text-amber-100"
          }`}
        >
          {passed === true
            ? "说过了！Next line…"
            : passed === false
              ? "Miss! 再试一次！"
              : result}
          {passed !== null ? (
            <>
              <br />
              听到：{result}
            </>
          ) : null}
        </p>
      ) : null}
    </section>
  );
}
