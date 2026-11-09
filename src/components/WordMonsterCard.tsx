"use client";

import { useState } from "react";

import { RewardModal } from "@/components/RewardModal";
import { SpeakButton } from "@/components/SpeakButton";
import { getMonsterDropRewards } from "@/data/monsterDrops";
import { getVocabularyById } from "@/data/vocabulary";
import {
  isSpeechRecognitionSupported,
  listenOnce,
  scoreSpeechAttempt,
} from "@/lib/speechRecognition";
import { getWordMonsterLabel } from "@/lib/wrongWord";
import { useGameStore } from "@/store/useGameStore";
import { RewardResult } from "@/types";

type WordMonsterCardProps = {
  wordId: string;
  wrongCount?: number;
  /** When true, this is a starter wild encounter (not from wrong answers). */
  wild?: boolean;
};

export function WordMonsterCard({
  wordId,
  wrongCount,
  wild = false,
}: WordMonsterCardProps) {
  const defeatMonster = useGameStore((s) => s.defeatMonster);
  const recordSpeakAttempt = useGameStore((s) => s.recordSpeakAttempt);
  const word = getVocabularyById(wordId);
  const monster = getWordMonsterLabel(wordId);

  const [listening, setListening] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [rewardResult, setRewardResult] = useState<RewardResult | null>(null);

  const supported = isSpeechRecognitionSupported();
  const previewDrops = getMonsterDropRewards(wordId);

  if (!word) {
    return null;
  }

  const expectedText = word.english;
  const keywords = [expectedText];

  function applyHit() {
    const loot = defeatMonster(wordId);
    if (!loot) return;
    setHitFlash(true);
    window.setTimeout(() => setHitFlash(false), 600);
    setRewardResult(loot);
  }

  async function handleSpeakAttack() {
    setListening(true);
    setResult(null);
    setPassed(null);
    recordSpeakAttempt();

    try {
      const { transcript } = await listenOnce();
      setResult(transcript);
      const score = scoreSpeechAttempt(transcript, expectedText, keywords);
      setPassed(score.passed);
      if (score.passed) {
        applyHit();
      }
    } catch {
      setResult("没听清楚，再试一次吧。");
      setPassed(false);
    } finally {
      setListening(false);
    }
  }

  function handleManualAttack() {
    recordSpeakAttempt();
    setPassed(true);
    setResult("手动确认：我已说出单词。");
    applyHit();
  }

  return (
    <>
      <section
        className={`mw-card mw-reward-panel overflow-hidden p-6 transition-shadow ${
          hitFlash ? "ring-4 ring-amber-300 shadow-[0_0_28px_rgba(251,191,36,0.45)]" : ""
        }`}
      >
        <div className="flex items-center gap-4">
          <span
            className={`text-5xl ${hitFlash ? "mw-map-pulse scale-110" : "mw-map-pulse"}`}
          >
            {monster.emoji}
          </span>
          <div>
            <h2 className="text-2xl font-black">{monster.titleCn}</h2>
            <p className="font-bold text-secondary">{monster.title}</p>
            {wild ? (
              <p className="text-sm text-muted">野外遭遇 Wild encounter</p>
            ) : (
              <p className="text-sm text-muted">错了 {wrongCount ?? 0} 次</p>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-black/20 p-4">
          <p className="text-sm font-black uppercase tracking-wide text-primary">
            开口攻击 Speak to Attack
          </p>
          <p className="mt-2 text-xl font-black">{word.english}</p>
          <p className="font-bold">{word.chinese}</p>
          <p className="mt-2 text-sm">{word.example}</p>
          <p className="text-sm text-muted">{word.exampleCn}</p>
          <div className="mt-4">
            <SpeakButton text={word.english} label="听示范 Listen" />
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-black/15 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-muted">
            掉落 Drop
          </p>
          <p className="mt-1 text-sm font-bold">
            {previewDrops
              .map((reward) => {
                if (reward.type === "resource" && reward.resource) {
                  return `${reward.resource} x${reward.amount}`;
                }
                if (reward.type === "xp") {
                  return `XP +${reward.xp}`;
                }
                return null;
              })
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <p className="mt-4 text-sm font-bold text-primary">
          大声说出英文单词，打中怪物！Say the English word to hit!
        </p>

        {supported ? (
          <button
            type="button"
            disabled={listening || rewardResult !== null}
            onClick={handleSpeakAttack}
            className="mw-btn mw-btn-primary mt-4 w-full disabled:opacity-60"
          >
            {listening
              ? "正在听… Listening…"
              : rewardResult
                ? "已击败 Defeated ✓"
                : "🎤 开口攻击 Attack"}
          </button>
        ) : (
          <button
            type="button"
            disabled={rewardResult !== null}
            onClick={handleManualAttack}
            className="mw-btn mw-btn-secondary mt-4 w-full disabled:opacity-60"
          >
            {rewardResult ? "已击败 Defeated ✓" : "我说出了 I said it"}
          </button>
        )}

        {result ? (
          <p
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${
              passed
                ? "bg-green-900/40 text-green-200"
                : "bg-amber-900/40 text-amber-100"
            }`}
          >
            {passed ? "Hit! 打中了！" : "Miss! 再试一次！"}
            <br />
            听到：{result}
          </p>
        ) : null}
      </section>

      <RewardModal
        open={rewardResult !== null}
        rewards={rewardResult?.rewards ?? []}
        unlocks={rewardResult?.unlocks ?? []}
        isFirstCompletion={rewardResult?.isFirstCompletion ?? true}
        onClose={() => setRewardResult(null)}
      />
    </>
  );
}
