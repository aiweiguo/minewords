"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { GameIcon } from "@/components/GameIcon";
import { assetMap } from "@/lib/assets";
import { requestMicPermission } from "@/lib/micPermission";
import { isSpeechRecognitionSupported } from "@/lib/speechRecognition";
import { useGameStore } from "@/store/useGameStore";

const loopSteps = [
  {
    key: "speak",
    emoji: "🗣️",
    cn: "说英语打怪",
    en: "Speak to attack",
  },
  {
    key: "wood",
    emoji: "🪵",
    cn: "攒木头",
    en: "Gather wood",
  },
  {
    key: "sword",
    emoji: "⚔️",
    cn: "做木剑",
    en: "Craft wooden sword",
  },
] as const;

/**
 * First-session ~30s coach: one composition on the hub.
 * Consumes hasSeenOnboarding via markOnboardingSeen.
 */
export function OnboardingCoach() {
  const router = useRouter();
  const hasSeenOnboarding = useGameStore((s) => s.hasSeenOnboarding);
  const markOnboardingSeen = useGameStore((s) => s.markOnboardingSeen);
  const [hydrated, setHydrated] = useState(false);
  const [micBusy, setMicBusy] = useState(false);
  const [speechOk, setSpeechOk] = useState(false);

  useEffect(() => {
    const finish = () => setHydrated(true);
    const persistApi = useGameStore.persist;
    if (persistApi.hasHydrated()) {
      finish();
    }
    const unsub = persistApi.onFinishHydration(finish);
    setSpeechOk(isSpeechRecognitionSupported());
    return unsub;
  }, []);

  if (!hydrated || hasSeenOnboarding) {
    return null;
  }

  async function finishAndExplore() {
    setMicBusy(true);
    // Warm mic permission before fight; denial still continues into explore.
    await requestMicPermission();
    markOnboardingSeen();
    router.push("/explore");
  }

  function dismissOnly() {
    markOnboardingSeen();
  }

  return (
    <div
      className="mw-coach-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mw-coach-title"
    >
      <div className="mw-coach-panel mw-game-panel">
        <div className="mw-coach-hero" aria-hidden>
          <GameIcon src={assetMap.sword} alt="" size="lg" className="mw-coach-sword" />
          <span className="mw-coach-spark" />
        </div>

        <p className="mw-coach-brand">MineWords</p>
        <h2 id="mw-coach-title" className="mw-coach-title">
          开口就是冒险！
        </h2>
        <p className="mw-coach-lead">
          用嘴当武器：说英语打怪 → 攒木头 → 做木剑。大约半分钟学会。
        </p>

        <ol className="mw-coach-loop" aria-label="主循环">
          {loopSteps.map((step, index) => (
            <li key={step.key} className="mw-coach-step">
              <span className="mw-coach-step-emoji" aria-hidden>
                {step.emoji}
              </span>
              <span className="mw-coach-step-cn">{step.cn}</span>
              <span className="mw-coach-step-en">{step.en}</span>
              {index < loopSteps.length - 1 ? (
                <span className="mw-coach-arrow" aria-hidden>
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <p className="mw-coach-mic-tip" role="status">
          {speechOk
            ? "先开麦克风开口打怪。点确认只是备用，开口才是正玩法。"
            : "推荐 Chrome。点确认可过关，但开口说英语才是正玩法。"}
        </p>

        <div className="mw-coach-actions">
          <button
            type="button"
            className="mw-btn mw-btn-primary mw-coach-cta w-full"
            disabled={micBusy}
            onClick={() => {
              void finishAndExplore();
            }}
          >
            {micBusy ? "准备麦克风…" : "开麦，出门打怪"}
          </button>
          <button
            type="button"
            className="mw-btn mw-btn-outline w-full"
            disabled={micBusy}
            onClick={dismissOnly}
          >
            先看看基地
          </button>
        </div>
      </div>
    </div>
  );
}
