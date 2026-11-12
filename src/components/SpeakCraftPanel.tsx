"use client";

import Link from "next/link";
import { useState } from "react";

import { GameIcon } from "@/components/GameIcon";
import { SpeakButton } from "@/components/SpeakButton";
import {
  getWeaponTierById,
  getWeaponTierIndex,
  weaponTiers,
  WeaponTierId,
} from "@/data/weapons";
import {
  isSpeechRecognitionSupported,
  listenOnce,
  scoreCraftSpeechAttempt,
} from "@/lib/speechRecognition";
import { getWeaponGoalSnapshot } from "@/lib/weaponGoal";
import { useGameStore } from "@/store/useGameStore";
import { RewardResult } from "@/types";

type SpeakCraftPanelProps = {
  weaponId: WeaponTierId;
};

export function SpeakCraftPanel({ weaponId }: SpeakCraftPanelProps) {
  const tier = getWeaponTierById(weaponId);
  const unlockedIds = useGameStore((s) => s.unlockedIds);
  const resources = useGameStore((s) => s.resources);
  const craftWeapon = useGameStore((s) => s.craftWeapon);
  const recordSpeakAttempt = useGameStore((s) => s.recordSpeakAttempt);

  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [craftResult, setCraftResult] = useState<RewardResult | null>(null);

  if (!tier) return null;
  const weapon = tier;

  const owned = unlockedIds.includes(weaponId);
  const snapshot = getWeaponGoalSnapshot(unlockedIds, resources);
  const isCurrentGoal = snapshot.goal?.id === weaponId;
  const tierIndex = getWeaponTierIndex(weaponId);
  const previousTier = tierIndex > 0 ? weaponTiers[tierIndex - 1] : null;
  const previousOwned = !previousTier || unlockedIds.includes(previousTier.id);
  const canAfford =
    previousOwned &&
    weapon.costs.every((cost) => (resources[cost.resource] ?? 0) >= cost.amount);
  const supported = isSpeechRecognitionSupported();
  const alreadyCrafted = owned || craftResult?.isFirstCompletion;

  function applyCraft() {
    const loot = craftWeapon(weaponId);
    if (!loot) {
      setPassed(false);
      setResult("材料不够，先去打怪凑齐。");
      return;
    }
    setCraftResult(loot);
  }

  async function handleSpeakCraft() {
    if (!canAfford || owned) return;
    setListening(true);
    setResult(null);
    setPassed(null);
    recordSpeakAttempt();

    try {
      const { transcript } = await listenOnce();
      setResult(transcript);
      const score = scoreCraftSpeechAttempt(
        transcript,
        weapon.expectedSpeech,
        weapon.speechKeywords,
      );
      setPassed(score.passed);
      if (score.passed) {
        applyCraft();
      }
    } catch {
      setResult("没听清楚，再试一次吧。");
      setPassed(false);
    } finally {
      setListening(false);
    }
  }

  function handleManualCraft() {
    if (!canAfford || owned) return;
    recordSpeakAttempt();
    setPassed(true);
    setResult("手动确认：我已说出配方。");
    applyCraft();
  }

  return (
    <section className="mw-card space-y-4 p-5">
      <div className="flex items-center gap-3">
        <GameIcon src={weapon.icon} alt={weapon.name} size="xl" />
        <div>
          <h2 className="text-2xl font-black">{weapon.name}</h2>
          <p className="text-lg font-bold text-secondary">{weapon.nameCn}</p>
          {isCurrentGoal ? (
            <p className="text-sm font-semibold text-primary">当前目标 Current goal</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl bg-black/20 px-4 py-3">
        <p className="text-xs font-black uppercase tracking-wide text-muted">
          材料 Cost
        </p>
        <ul className="mt-2 space-y-1">
          {weapon.costs.map((cost) => {
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

      {alreadyCrafted ? (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-900/20 px-4 py-4 text-center">
          <p className="text-lg font-black text-cyan-100">
            {weapon.nameCn}已挂上武器架！
          </p>
          <p className="mt-1 text-sm font-semibold text-cyan-200/80">
            {weapon.name} is on your weapon rack.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link href="/" className="mw-btn mw-btn-primary">
              回基地看武器架
            </Link>
            <Link href="/review" className="mw-btn mw-btn-outline">
              继续打怪
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-xl bg-black/15 p-4">
            <p className="text-sm font-black uppercase tracking-wide text-primary">
              开口合成 Speak to Craft
            </p>
            <p className="mt-2 text-xl font-black">{weapon.expectedSpeech}</p>
            <p className="mt-1 text-sm font-semibold">{weapon.speechHintCn}</p>
            <p className="text-sm text-muted">{weapon.speechHintEn}</p>
            <div className="mt-3">
              <SpeakButton text={weapon.expectedSpeech} label="听示范 Listen" />
            </div>
          </div>

          {!previousOwned && previousTier ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-amber-100">
                先合成{previousTier.nameCn}，再升级这一把。
              </p>
              <Link
                href={`/crafting/${previousTier.id}`}
                className="mw-btn mw-btn-secondary w-full"
              >
                去做{previousTier.nameCn}
              </Link>
            </div>
          ) : !canAfford ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-amber-100">
                材料不够 — 先出门打怪掉落材料。
              </p>
              <Link href="/review" className="mw-btn mw-btn-primary w-full">
                继续打怪 Keep fighting
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {supported ? (
                <button
                  type="button"
                  disabled={listening}
                  onClick={handleSpeakCraft}
                  className="mw-btn mw-btn-secondary w-full disabled:opacity-60"
                >
                  {listening ? "正在听… Listening…" : "🎤 开口合成 Craft"}
                </button>
              ) : null}
              <button
                type="button"
                disabled={listening}
                onClick={handleManualCraft}
                className={`mw-btn w-full disabled:opacity-60 ${
                  supported ? "mw-btn-outline" : "mw-btn-secondary"
                }`}
              >
                我说出了配方 I said it
              </button>
            </div>
          )}

          {result ? (
            <p
              className={`rounded-xl px-4 py-3 text-sm font-bold ${
                passed
                  ? "bg-green-900/40 text-green-200"
                  : "bg-amber-900/40 text-amber-100"
              }`}
            >
              {passed ? "Crafted! 合成成功！" : "Miss! 再试一次！"}
              <br />
              听到：{result}
            </p>
          ) : null}
        </>
      )}

      <p className="text-xs font-semibold text-muted">
        {weapon.nextPreviewCn}
        <span className="mt-0.5 block">{weapon.nextPreviewEn}</span>
      </p>
    </section>
  );
}
