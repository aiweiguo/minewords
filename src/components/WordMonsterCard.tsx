"use client";

import { useEffect, useState } from "react";

import { FollowConfirmControls } from "@/components/FollowConfirmControls";
import { GameIcon } from "@/components/GameIcon";
import { PhonicsMoment } from "@/components/PhonicsMoment";
import { RewardModal } from "@/components/RewardModal";
import { SpeakButton } from "@/components/SpeakButton";
import { ExploreZoneId } from "@/data/exploreZones";
import { getMonsterDropRewards } from "@/data/monsterDrops";
import { getVocabularyById } from "@/data/vocabulary";
import { useFollowConfirmRitual } from "@/hooks/useFollowConfirmRitual";
import { usePhonicsSession } from "@/hooks/usePhonicsSession";
import { FluencyRung, FLUENCY_RUNG_ORDER } from "@/lib/attackSpeech";
import { assetMap, getResourceIcon } from "@/lib/assets";
import { getMonsterDropRewardsForZone } from "@/lib/exploreZones";
import {
  applyDamage,
  applyMissStepDown,
  FLUENCY_DAMAGE,
  getPromptForRung,
  getStartingSuggestedRung,
  missStepDownFeedback,
  MONSTER_MAX_HP,
  raiseSuggestedRung,
  rungLabelCn,
  rungLabelEn,
  scoreFluencyAttempt,
} from "@/lib/fluencyLadder";
import { playGameSfx } from "@/lib/gameSfx";
import {
  getUnknownAttackWordId,
  listAttackFocusWordIds,
  resolveMissPhonicsWordId,
  scoreFluencyAfterPhonics,
} from "@/lib/phonics";
import {
  isSpeechRecognitionSupported,
  listenOnce,
} from "@/lib/speechRecognition";
import { getWordMonsterLabel } from "@/lib/wrongWord";
import { useGameStore } from "@/store/useGameStore";
import { Reward, RewardResult } from "@/types";

type LootChip = {
  id: string;
  label: string;
  iconSrc: string;
};

type WordMonsterCardProps = {
  wordId: string;
  wrongCount?: number;
  /** When true, this is a starter wild encounter (not from wrong answers). */
  wild?: boolean;
  /** Explore zone for material-biased drops. */
  zoneId?: ExploreZoneId;
  /** Allow re-fighting after a win (zone wild farming). */
  farmable?: boolean;
};

export function WordMonsterCard({
  wordId,
  wrongCount,
  wild = false,
  zoneId,
  farmable = false,
}: WordMonsterCardProps) {
  const defeatMonster = useGameStore((s) => s.defeatMonster);
  const recordSpeakAttempt = useGameStore((s) => s.recordSpeakAttempt);
  const recordSpeakCompletion = useGameStore((s) => s.recordSpeakCompletion);
  const recordConfirmCompletion = useGameStore((s) => s.recordConfirmCompletion);
  const learnedWordIds = useGameStore((s) => s.learnedWordIds);
  const masteredWordIds = useGameStore((s) => s.masteredWordIds);
  const word = getVocabularyById(wordId);
  const monster = getWordMonsterLabel(wordId);

  const [listening, setListening] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [lootChips, setLootChips] = useState<LootChip[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    cn: string;
    en: string;
    kind: "miss" | "partial" | "full";
  } | null>(null);
  const [hp, setHp] = useState(MONSTER_MAX_HP);
  const [suggestedRung, setSuggestedRung] = useState<FluencyRung>(() =>
    getStartingSuggestedRung(zoneId),
  );
  /** Consecutive fluency score misses (MW-35); resets on hit / farm reset. */
  const [missStreak, setMissStreak] = useState(0);
  const [rewardResult, setRewardResult] = useState<RewardResult | null>(null);
  // Defer mic detection to after mount so SSR markup matches first client paint.
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

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  const unknownWordId = getUnknownAttackWordId(
    wordId,
    learnedWordIds,
    masteredWordIds,
  );
  const cueVisible = showPhonicsCue(unknownWordId);

  const previewDrops = zoneId
    ? getMonsterDropRewardsForZone(wordId, zoneId)
    : getMonsterDropRewards(wordId);
  const attack = getPromptForRung(wordId, suggestedRung, zoneId);
  const follow = useFollowConfirmRitual(attack.demoText);

  if (!word) {
    return null;
  }

  function flashHit() {
    setHitFlash(true);
    window.setTimeout(() => setHitFlash(false), 520);
  }

  function rewardsToChips(rewards: Reward[]): LootChip[] {
    return rewards
      .map((reward, index) => {
        if (reward.type === "resource" && reward.resource) {
          return {
            id: `res-${reward.resource}-${index}`,
            label: `${reward.resource} x${reward.amount}`,
            iconSrc: getResourceIcon(reward.resource),
          };
        }
        if (reward.type === "xp") {
          return {
            id: `xp-${index}`,
            label: `XP +${reward.xp}`,
            iconSrc: assetMap.star,
          };
        }
        return null;
      })
      .filter((chip): chip is LootChip => chip != null);
  }

  function popLoot(rewards: Reward[]) {
    const chips = rewardsToChips(rewards);
    if (chips.length === 0) return;
    setLootChips(chips);
    playGameSfx("loot");
    window.setTimeout(() => setLootChips([]), 1400);
  }

  function finishEncounter() {
    const loot = defeatMonster(wordId, { zoneId, farmable });
    if (!loot) return;
    flashHit();
    popLoot(loot.rewards);
    setRewardResult(loot);
  }

  function resolveHit(
    damage: number,
    matched: FluencyRung | null,
    hitFeedback: { cn: string; en: string; kind: "partial" | "full" },
  ) {
    const nextHp = applyDamage(hp, damage);
    setHp(nextHp);
    flashHit();
    playGameSfx("hit");
    setMissStreak(0);
    setSuggestedRung((current) => raiseSuggestedRung(current, matched));
    if (nextHp <= 0) {
      setFeedback({
        cn: "击败怪物！掉落材料了",
        en: "Monster down — loot incoming!",
        kind: "full",
      });
      finishEncounter();
      return;
    }
    setFeedback(hitFeedback);
  }

  function resolveMiss(base: { cn: string; en: string }) {
    const step = applyMissStepDown(suggestedRung, missStreak);
    setMissStreak(step.nextMissStreak);
    setSuggestedRung(step.nextRung);
    if (step.didStepDown) {
      const down = missStepDownFeedback(step.nextRung);
      setFeedback({
        cn: `${base.cn} ${down.cn}`,
        en: `${base.en} ${down.en}`,
        kind: "miss",
      });
      return;
    }
    setFeedback({
      cn: base.cn,
      en: base.en,
      kind: "miss",
    });
  }

  function resetEncounter() {
    setResult(null);
    setFeedback(null);
    setHp(MONSTER_MAX_HP);
    setSuggestedRung(getStartingSuggestedRung(zoneId));
    setMissStreak(0);
    resetPhonics();
  }

  function handleRewardClose() {
    setRewardResult(null);
    if (farmable) {
      resetEncounter();
    }
  }

  function startPhonics(targetId?: string | null) {
    const id = targetId ?? unknownWordId;
    if (!id) return;
    openPhonics(id);
    setFeedback(null);
    setResult(null);
  }

  function handlePhonicsComplete() {
    completePhonics();
    setFeedback({
      cn: "短学完成！再说一次来攻击",
      en: "Mini-learn done — speak again to attack!",
      kind: "partial",
    });
    setResult(null);
  }

  async function handleSpeakAttack() {
    setListening(true);
    setResult(null);
    setFeedback(null);
    recordSpeakAttempt();

    try {
      const { transcript } = await listenOnce();
      setResult(transcript);
      let score = scoreFluencyAttempt(transcript, wordId, zoneId);

      // After phonics, accept a soft word-level hit even if the ladder miss.
      if (
        (!score.rung || score.damage <= 0) &&
        phonicsBoost &&
        scoreFluencyAfterPhonics(
          transcript,
          wordId,
          attack.expectedText,
          attack.keywords,
        )
      ) {
        score = {
          rung: "word",
          damage: FLUENCY_DAMAGE.word,
          matchedKeywords: attack.keywords,
          isPartial: true,
          feedbackCn: "短学后打中了！再说短句伤害更大",
          feedbackEn: "Hit after phonics! Try a short phrase for more.",
        };
      }

      if (!score.rung || score.damage <= 0) {
        resolveMiss({
          cn: score.feedbackCn,
          en: score.feedbackEn,
        });
        // Unknown-word miss with a transcript → embed phonics, then return.
        const missFocus = resolveMissPhonicsWordId({
          transcript,
          candidateWordIds: listAttackFocusWordIds(wordId),
          learnedWordIds,
          masteredWordIds,
          fallbackWordId: unknownWordId,
        });
        if (missFocus) {
          startPhonics(missFocus);
        }
        return;
      }
      recordSpeakCompletion();
      resolveHit(score.damage, score.rung, {
        cn: score.feedbackCn,
        en: score.feedbackEn,
        kind: score.isPartial ? "partial" : "full",
      });
    } catch {
      // Mic / recognition failure — keep miss feedback + cue; don't force phonics.
      setResult("没听清楚，再试一次吧。");
      setFeedback({
        cn: "没听清楚，再试一次！",
        en: "Didn't catch that — try again!",
        kind: "miss",
      });
    } finally {
      setListening(false);
    }
  }

  function handleManualAttack() {
    if (follow.softPath && !follow.canConfirm) return;
    recordSpeakAttempt();
    recordConfirmCompletion();
    const damage = FLUENCY_DAMAGE[suggestedRung];
    const isPartial = damage < MONSTER_MAX_HP;
    setResult(
      follow.softPath
        ? `跟读确认：${attack.manualLabelCn}。`
        : `手动确认：${attack.manualLabelCn}。`,
    );
    resolveHit(damage, suggestedRung, {
      cn: isPartial
        ? suggestedRung === "word"
          ? "只说了单词，伤害变小！再说短句伤害更大"
          : "短句打中了！再说整句伤害打满"
        : "整句打满伤害！",
      en: isPartial
        ? suggestedRung === "word"
          ? "Word only — smaller damage! Try a short phrase for more."
          : "Phrase hit! Full sentence does max damage."
        : "Full sentence — max damage!",
      kind: isPartial ? "partial" : "full",
    });
  }

  const defeated = rewardResult !== null;
  const hearts = Array.from({ length: MONSTER_MAX_HP }, (_, index) => {
    const filled = index < hp;
    return filled ? "♥" : "♡";
  }).join("");

  return (
    <>
      <section
        className={`mw-card mw-reward-panel relative overflow-hidden p-6 transition-shadow ${
          hitFlash ? "mw-hit-flash ring-4 ring-amber-300 shadow-[0_0_28px_rgba(251,191,36,0.45)]" : ""
        }`}
      >
        {hitFlash ? <div className="mw-hit-flash-burst" aria-hidden /> : null}
        {lootChips.length > 0 ? (
          <div className="mw-loot-pop-layer" aria-live="polite">
            {lootChips.map((chip, index) => (
              <div
                key={chip.id}
                className="mw-loot-chip"
                style={{ ["--mw-loot-i" as string]: String(index) }}
              >
                <GameIcon src={chip.iconSrc} alt="" size="sm" />
                <span>{chip.label}</span>
              </div>
            ))}
          </div>
        ) : null}
        <div className="flex items-center gap-4">
          <span
            className={`text-5xl ${hitFlash ? "mw-hit-shake scale-110" : "mw-map-pulse"}`}
          >
            {monster.emoji}
          </span>
          <div>
            <h2 className="text-2xl font-black">{monster.titleCn}</h2>
            <p className="font-bold text-secondary">{monster.title}</p>
            {wild ? (
              <p className="text-sm text-muted">
                {farmable
                  ? "区域野怪 · 可反复打 Zone wild"
                  : "野外遭遇 Wild encounter"}
              </p>
            ) : (
              <p className="text-sm text-muted">错了 {wrongCount ?? 0} 次</p>
            )}
          </div>
        </div>

        <div
          className="mw-monster-hp mt-4"
          role="status"
          aria-label={`Monster HP ${hp} of ${MONSTER_MAX_HP}`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-black uppercase tracking-wide text-muted">
              怪物血量 HP
            </p>
            <p className="mw-monster-hp-hearts" aria-hidden>
              {hearts}
            </p>
          </div>
          <div className="mw-monster-hp-track mt-2">
            <div
              className="mw-monster-hp-fill"
              style={{ width: `${(hp / MONSTER_MAX_HP) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-muted">
            流利阶梯 Fluency: 单词 1 伤 · 短句 2 伤 · 整句打满 · 连续 miss 降阶
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-black/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-black uppercase tracking-wide text-primary">
              开口攻击 Speak to Attack
            </p>
            <p className="rounded-lg bg-black/25 px-2 py-1 text-xs font-black text-amber-100">
              当前台阶 {rungLabelCn(suggestedRung)} · {rungLabelEn(suggestedRung)}
            </p>
          </div>
          <p className="mt-2 text-xl font-black">{attack.expectedText}</p>
          <p className="font-bold">{word.chinese}</p>
          <p className="mt-2 text-sm font-semibold">{attack.hintCn}</p>
          <p className="text-sm text-muted">{attack.hintEn}</p>
          <ul className="mw-fluency-rungs mt-3">
            {FLUENCY_RUNG_ORDER.map((rung) => {
              const prompt = getPromptForRung(wordId, rung, zoneId);
              const active = rung === suggestedRung;
              return (
                <li
                  key={rung}
                  className={`mw-fluency-rung ${active ? "mw-fluency-rung-active" : ""}`}
                >
                  <span className="mw-fluency-rung-label">
                    {rungLabelCn(rung)}
                    <span className="text-muted"> / {rungLabelEn(rung)}</span>
                  </span>
                  <span className="mw-fluency-rung-text">{prompt.expectedText}</span>
                  <span className="mw-fluency-rung-dmg">
                    {FLUENCY_DAMAGE[rung]} 伤
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4">
            <SpeakButton text={attack.demoText} label="听示范 Listen" />
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

        {phonicsWordId ? (
          <div className="mt-4">
            <PhonicsMoment
              wordId={phonicsWordId}
              resumeLabelCn="开口攻击"
              resumeLabelEn="speak-attack"
              reasonCn="这个词还不熟 — 先听音块再跟读，然后回来打怪！"
              reasonEn="New word — listen to the sounds, repeat, then attack!"
              onComplete={handlePhonicsComplete}
              onSkip={skipPhonics}
            />
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm font-bold text-primary">
              {attack.promptCn} {attack.promptEn}
            </p>

            {cueVisible ? (
              <button
                type="button"
                onClick={() => startPhonics()}
                className="mw-phonics-cue mt-3"
              >
                不会读？先短学一下 · Learn this word
              </button>
            ) : null}

            {phonicsBoost ? (
              <p className="mt-3 text-xs font-bold text-cyan-100/90">
                短学加成：判定更宽松 Phonics boost — extra-lenient match
              </p>
            ) : null}

            <div className="mt-4 space-y-2">
              {supported ? (
                <button
                  type="button"
                  disabled={listening || defeated || hp <= 0}
                  onClick={handleSpeakAttack}
                  className="mw-btn mw-btn-primary w-full disabled:opacity-60"
                >
                  {listening
                    ? "正在听… Listening…"
                    : defeated
                      ? "已击败 Defeated ✓"
                      : "🎤 开口攻击 Attack"}
                </button>
              ) : null}
              <FollowConfirmControls
                softPath={follow.softPath}
                phase={follow.phase}
                secondsLeft={follow.secondsLeft}
                canConfirm={follow.canConfirm}
                ritualBusy={follow.ritualBusy}
                disabled={listening || defeated || hp <= 0}
                confirmLabel={
                  defeated
                    ? "已击败 Defeated ✓"
                    : `${attack.manualLabelCn} ${attack.manualLabelEn}`
                }
                onStartRitual={() => {
                  void follow.startRitual();
                }}
                onConfirm={handleManualAttack}
                confirmClassName={
                  supported ? "mw-btn-outline" : "mw-btn-secondary"
                }
              />
            </div>
          </>
        )}

        {(feedback || result) && !phonicsOpen ? (
          <p
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${
              feedback?.kind === "full"
                ? "bg-green-900/40 text-green-200"
                : feedback?.kind === "partial"
                  ? "mw-fluency-partial-feedback"
                  : "bg-amber-900/40 text-amber-100"
            }`}
          >
            {feedback ? (
              <>
                {feedback.cn}
                <br />
                <span className="text-xs opacity-90">{feedback.en}</span>
              </>
            ) : null}
            {result ? (
              <>
                <br />
                听到：{result}
              </>
            ) : null}
            {hp > 0 && feedback?.kind !== "miss" ? (
              <>
                <br />
                <span className="text-xs">还剩 {hp} 格血 Remaining HP {hp}</span>
              </>
            ) : null}
          </p>
        ) : null}
      </section>

      <RewardModal
        open={rewardResult !== null}
        rewards={rewardResult?.rewards ?? []}
        unlocks={rewardResult?.unlocks ?? []}
        isFirstCompletion={rewardResult?.isFirstCompletion ?? true}
        onClose={handleRewardClose}
        farmable={farmable}
      />
    </>
  );
}
