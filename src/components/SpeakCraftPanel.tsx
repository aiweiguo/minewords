"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { FollowConfirmControls } from "@/components/FollowConfirmControls";
import { GameIcon } from "@/components/GameIcon";
import { PhonicsMoment } from "@/components/PhonicsMoment";
import { SpeakButton } from "@/components/SpeakButton";
import {
  getWeaponTierById,
  getWeaponTierIndex,
  weaponTiers,
  WeaponTierId,
} from "@/data/weapons";
import { useFollowConfirmRitual } from "@/hooks/useFollowConfirmRitual";
import { usePhonicsSession } from "@/hooks/usePhonicsSession";
import {
  getUnknownCraftWordId,
  listCraftFocusWordIds,
  resolveMissPhonicsWordId,
  scoreSpeechAfterPhonics,
} from "@/lib/phonics";
import { playGameSfx } from "@/lib/gameSfx";
import {
  craftSpeechMinKeywords,
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
  const roomBlocks = useGameStore((s) => s.roomBlocks);
  const craftWeapon = useGameStore((s) => s.craftWeapon);
  const recordSpeakAttempt = useGameStore((s) => s.recordSpeakAttempt);
  const recordSpeakCompletion = useGameStore((s) => s.recordSpeakCompletion);
  const recordConfirmCompletion = useGameStore((s) => s.recordConfirmCompletion);
  const learnedWordIds = useGameStore((s) => s.learnedWordIds);
  const masteredWordIds = useGameStore((s) => s.masteredWordIds);
  const defeatedMonsterIds = useGameStore((s) => s.defeatedMonsterIds);

  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [craftResult, setCraftResult] = useState<RewardResult | null>(null);
  const [craftFlash, setCraftFlash] = useState(false);
  const [supported, setSupported] = useState(false);
  const {
    phonicsWordId,
    phonicsBoost,
    phonicsOpen,
    openPhonics,
    skipPhonics,
    completePhonics,
    resetPhonics,
    showPhonicsCue,
  } = usePhonicsSession();
  const follow = useFollowConfirmRitual(tier?.expectedSpeech ?? "");

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    setListening(false);
    setResult(null);
    setPassed(null);
    setCraftResult(null);
    resetPhonics();
  }, [weaponId, resetPhonics]);

  if (!tier) return null;
  const weapon = tier;

  const unknownWordId = getUnknownCraftWordId(
    weaponId,
    learnedWordIds,
    masteredWordIds,
  );
  const cueVisible = showPhonicsCue(unknownWordId);

  const owned = unlockedIds.includes(weaponId);
  const snapshot = getWeaponGoalSnapshot(unlockedIds, resources, roomBlocks, {
    learnedWordIds,
    masteredWordIds,
    unlockedIds,
    defeatedMonsterIds,
  });
  const isCurrentGoal = snapshot.goal?.id === weaponId;
  const tierIndex = getWeaponTierIndex(weaponId);
  const previousTier = tierIndex > 0 ? weaponTiers[tierIndex - 1] : null;
  const previousOwned = !previousTier || unlockedIds.includes(previousTier.id);
  const canAfford =
    previousOwned &&
    weapon.costs.every((cost) => (resources[cost.resource] ?? 0) >= cost.amount);
  const alreadyCrafted = owned || craftResult?.isFirstCompletion;

  function celebrateCraft() {
    setCraftFlash(true);
    playGameSfx("craft");
    window.setTimeout(() => setCraftFlash(false), 900);
  }

  function applyCraft() {
    const loot = craftWeapon(weaponId);
    if (!loot) {
      setPassed(false);
      setResult("材料不够，先去打怪凑齐。");
      return;
    }
    celebrateCraft();
    setCraftResult(loot);
  }

  function startPhonics(targetId?: string | null) {
    const id = targetId ?? unknownWordId;
    if (!id) return;
    openPhonics(id);
    setPassed(null);
    setResult(null);
  }

  function handlePhonicsComplete() {
    completePhonics();
    setPassed(null);
    setResult("短学完成！再说一次来合成");
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
      const score = phonicsBoost
        ? scoreSpeechAfterPhonics(
            transcript,
            weapon.expectedSpeech,
            weapon.speechKeywords,
          )
        : scoreCraftSpeechAttempt(
            transcript,
            weapon.expectedSpeech,
            weapon.speechKeywords,
            craftSpeechMinKeywords(weaponId),
          );
      setPassed(score.passed);
      if (score.passed) {
        recordSpeakCompletion();
        applyCraft();
      } else {
        const missFocus = resolveMissPhonicsWordId({
          transcript,
          candidateWordIds: listCraftFocusWordIds(weaponId),
          learnedWordIds,
          masteredWordIds,
          fallbackWordId: unknownWordId,
        });
        if (missFocus) {
          startPhonics(missFocus);
        }
      }
    } catch {
      // Mic failure — keep retry feedback; cue still available for unknown words.
      setResult("没听清楚，再试一次吧。");
      setPassed(false);
    } finally {
      setListening(false);
    }
  }

  function handleManualCraft() {
    if (!canAfford || owned) return;
    if (follow.softPath && !follow.canConfirm) return;
    recordSpeakAttempt();
    recordConfirmCompletion();
    setPassed(true);
    setResult(
      follow.softPath ? "跟读确认：我已说出配方。" : "手动确认：我已说出配方。",
    );
    applyCraft();
  }

  return (
    <section
      className={`mw-card relative space-y-4 overflow-hidden p-5 ${
        craftFlash ? "mw-craft-success-flash" : ""
      }`}
    >
      {craftFlash ? <div className="mw-craft-success-burst" aria-hidden /> : null}
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
        <div
          className={`rounded-xl border border-cyan-500/30 bg-cyan-900/20 px-4 py-4 text-center ${
            craftFlash ? "mw-craft-success-panel" : ""
          }`}
        >
          <p className="text-lg font-black text-cyan-100">
            {craftFlash
              ? `合成成功！${weapon.nameCn}已挂上武器架！`
              : `${weapon.nameCn}已挂上武器架！`}
          </p>
          <p className="mt-1 text-sm font-semibold text-cyan-200/80">
            {weapon.name} is on your weapon rack.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link
              href={
                snapshot.status === "line-complete" &&
                (snapshot.homeFill?.empty ?? 0) === 0 &&
                snapshot.weekly &&
                !snapshot.weekly.done
                  ? snapshot.primaryCta.href
                  : "/"
              }
              className="mw-btn mw-btn-primary"
            >
              {snapshot.status === "line-complete" &&
              (snapshot.homeFill?.empty ?? 0) > 0
                ? `装扮我家 · 还差 ${snapshot.homeFill?.empty} 位`
                : snapshot.status === "line-complete" &&
                    snapshot.weekly &&
                    !snapshot.weekly.done
                  ? snapshot.primaryCta.labelCn
                  : "回基地看武器架"}
            </Link>
            {snapshot.status === "line-complete" ? null : (
              <Link href="/explore" className="mw-btn mw-btn-outline">
                继续打怪
              </Link>
            )}
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

          {phonicsWordId ? (
            <PhonicsMoment
              wordId={phonicsWordId}
              resumeLabelCn="开口合成"
              resumeLabelEn="speak-craft"
              reasonCn="配方里有生词 — 先听音块跟读，再回来合成！"
              reasonEn="New recipe word — listen, repeat, then craft!"
              onComplete={handlePhonicsComplete}
              onSkip={skipPhonics}
            />
          ) : !previousOwned && previousTier ? (
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
              <Link href="/explore" className="mw-btn mw-btn-primary w-full">
                继续打怪 Keep fighting
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {cueVisible ? (
                <button
                  type="button"
                  onClick={() => startPhonics()}
                  className="mw-phonics-cue"
                >
                  不会读？先短学一下 · Learn this word
                </button>
              ) : null}
              {phonicsBoost ? (
                <p className="text-xs font-bold text-cyan-100/90">
                  短学加成：判定更宽松 Phonics boost — extra-lenient match
                </p>
              ) : null}
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
              <FollowConfirmControls
                softPath={follow.softPath}
                phase={follow.phase}
                secondsLeft={follow.secondsLeft}
                canConfirm={follow.canConfirm}
                ritualBusy={follow.ritualBusy}
                disabled={listening}
                confirmLabel="我说出了配方 I said it"
                onStartRitual={() => {
                  void follow.startRitual();
                }}
                onConfirm={handleManualCraft}
                confirmClassName={
                  supported ? "mw-btn-outline" : "mw-btn-secondary"
                }
              />
            </div>
          )}

          {result && !phonicsOpen ? (
            <p
              className={`rounded-xl px-4 py-3 text-sm font-bold ${
                passed
                  ? "bg-green-900/40 text-green-200"
                  : "bg-amber-900/40 text-amber-100"
              }`}
            >
              {passed === true
                ? "Crafted! 合成成功！"
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
        </>
      )}

      <p className="text-xs font-semibold text-muted">
        {weapon.nextPreviewCn}
        <span className="mt-0.5 block">{weapon.nextPreviewEn}</span>
      </p>
    </section>
  );
}
