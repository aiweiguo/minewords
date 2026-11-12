"use client";

import Link from "next/link";
import { useState } from "react";

import { GameIcon } from "@/components/GameIcon";
import { SpeakButton } from "@/components/SpeakButton";
import {
  canAffordTrade,
  getTradeOfferById,
  TradeOffer,
} from "@/data/trades";
import {
  isSpeechRecognitionSupported,
  listenOnce,
  scoreTradeSpeechAttempt,
} from "@/lib/speechRecognition";
import { useGameStore } from "@/store/useGameStore";
import { RewardResult } from "@/types";

type SpeakTradePanelProps = {
  tradeId: string;
};

export function SpeakTradePanel({ tradeId }: SpeakTradePanelProps) {
  const offer = getTradeOfferById(tradeId);
  const resources = useGameStore((s) => s.resources);
  const executeTrade = useGameStore((s) => s.executeTrade);
  const recordSpeakAttempt = useGameStore((s) => s.recordSpeakAttempt);

  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [tradeResult, setTradeResult] = useState<RewardResult | null>(null);

  if (!offer) return null;

  const canAfford = canAffordTrade(offer, resources);
  const supported = isSpeechRecognitionSupported();

  function applyTrade(current: TradeOffer) {
    const loot = executeTrade(current.id);
    if (!loot) {
      setPassed(false);
      setResult("材料不够，先攒够再来交易。");
      return;
    }
    setTradeResult(loot);
  }

  async function handleSpeakTrade() {
    if (!offer || !canAfford) return;
    setListening(true);
    setResult(null);
    setPassed(null);
    setTradeResult(null);
    recordSpeakAttempt();

    try {
      const { transcript } = await listenOnce();
      setResult(transcript);
      const score = scoreTradeSpeechAttempt(
        transcript,
        offer.expectedSpeech,
        offer.speechKeywords,
      );
      setPassed(score.passed);
      if (score.passed) {
        applyTrade(offer);
      }
    } catch {
      setResult("没听清楚，再试一次吧。");
      setPassed(false);
    } finally {
      setListening(false);
    }
  }

  function handleManualTrade() {
    if (!offer || !canAfford) return;
    recordSpeakAttempt();
    setPassed(true);
    setResult("手动确认：我已说出交易句。");
    applyTrade(offer);
  }

  return (
    <section className="mw-card space-y-4 p-5">
      <div className="flex items-center gap-3">
        <GameIcon src={offer.icon} alt={offer.title} size="xl" />
        <div>
          <h2 className="text-2xl font-black">{offer.title}</h2>
          <p className="text-lg font-bold text-secondary">{offer.titleCn}</p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/25 bg-amber-950/25 px-4 py-3">
        <p className="text-xs font-black uppercase tracking-wide text-amber-100/80">
          Villager 村民
        </p>
        <p className="mt-1 text-base font-bold">{offer.npcLine}</p>
        <p className="text-sm font-semibold text-muted">{offer.npcLineCn}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-black/20 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-muted">
            你给 Give
          </p>
          <ul className="mt-2 space-y-1">
            {offer.costs.map((cost) => {
              const have = resources[cost.resource] ?? 0;
              const ok = have >= cost.amount;
              return (
                <li
                  key={cost.resource}
                  className={`text-sm font-bold ${ok ? "text-green-200" : "text-amber-100"}`}
                >
                  {cost.resource} {have}/{cost.amount}
                  {ok ? " ✓" : " — 还差"}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-xl bg-black/20 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-muted">
            你得 Get
          </p>
          <ul className="mt-2 space-y-1">
            {offer.gains.map((gain) => (
              <li key={gain.resource} className="text-sm font-bold text-cyan-100">
                {gain.resource} ×{gain.amount}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl bg-black/15 p-4">
        <p className="text-sm font-black uppercase tracking-wide text-primary">
          开口交易 Speak to Trade
        </p>
        <p className="mt-2 text-xl font-black">{offer.expectedSpeech}</p>
        <p className="mt-1 text-sm font-semibold">{offer.speechHintCn}</p>
        <p className="text-sm text-muted">{offer.speechHintEn}</p>
        <div className="mt-3">
          <SpeakButton text={offer.expectedSpeech} label="听示范 Listen" />
        </div>
      </div>

      {tradeResult && passed ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-green-500/30 bg-green-900/30 px-4 py-4 text-center">
            <p className="text-lg font-black text-green-100">Traded! 交易成功！</p>
            <p className="mt-1 text-sm font-semibold text-green-200/80">
              听到：{result}
            </p>
            {tradeResult.isFirstCompletion ? (
              <p className="mt-3 text-sm font-black text-cyan-100">
                第一次和村民交易！Village trader unlocked.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTradeResult(null);
                setResult(null);
                setPassed(null);
              }}
              className="mw-btn mw-btn-secondary"
            >
              再交易一次 Trade again
            </button>
            <Link href="/inventory" className="mw-btn mw-btn-outline">
              看背包
            </Link>
            <Link href="/explore" className="mw-btn mw-btn-outline">
              出门打怪
            </Link>
          </div>
        </div>
      ) : !canAfford ? (
        <div className="space-y-3">
          <p className="text-sm font-bold text-amber-100">
            材料不够 — 先出门打怪或用木头换绿宝石。
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/explore" className="mw-btn mw-btn-primary">
              出门打怪
            </Link>
            {offer.id !== "wood-for-emerald" ? (
              <Link href="/trade?offer=wood-for-emerald" className="mw-btn mw-btn-outline">
                先换绿宝石
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {supported ? (
            <button
              type="button"
              disabled={listening}
              onClick={handleSpeakTrade}
              className="mw-btn mw-btn-secondary w-full disabled:opacity-60"
            >
              {listening ? "正在听… Listening…" : "🎤 开口交易 Trade"}
            </button>
          ) : null}
          <button
            type="button"
            disabled={listening}
            onClick={handleManualTrade}
            className={`mw-btn w-full disabled:opacity-60 ${
              supported ? "mw-btn-outline" : "mw-btn-secondary"
            }`}
          >
            我说出了交易句 I said it
          </button>
        </div>
      )}

      {result && !(tradeResult && passed) ? (
        <p
          className={`rounded-xl px-4 py-3 text-sm font-bold ${
            passed
              ? "bg-green-900/40 text-green-200"
              : "bg-amber-900/40 text-amber-100"
          }`}
        >
          {passed ? "Traded! 交易成功！" : "Miss! 再试一次！"}
          <br />
          听到：{result}
        </p>
      ) : null}
    </section>
  );
}
