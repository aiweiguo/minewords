"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  FollowConfirmPhase,
  followCountdownSeconds,
} from "@/lib/followConfirm";
import { speakAndWait } from "@/lib/speak";
import { isSpeechRecognitionSupported } from "@/lib/speechRecognition";

/**
 * Soft path when Web Speech is missing: play TTS → follow countdown → unlock confirm.
 * When mic/recognition works, softPath=false and FollowConfirmControls demotes
 * confirm (collapsed + long-press; MW-56) — mic speak stays primary.
 */
export function useFollowConfirmRitual(demoText: string) {
  // Default locked (soft path on) until mount detects Web Speech — avoids a
  // one-frame unlocked confirm flash on Safari/iOS.
  const [softPath, setSoftPath] = useState(true);
  const [phase, setPhase] = useState<FollowConfirmPhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const runIdRef = useRef(0);
  const tickRef = useRef<number | null>(null);

  const clearTick = useCallback(() => {
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    runIdRef.current += 1;
    clearTick();
    setPhase("idle");
    setSecondsLeft(0);
  }, [clearTick]);

  useEffect(() => {
    setSoftPath(!isSpeechRecognitionSupported());
  }, []);

  // New prompt / monster / offer → restart ritual.
  useEffect(() => {
    reset();
  }, [demoText, reset]);

  useEffect(() => () => clearTick(), [clearTick]);

  const startRitual = useCallback(async () => {
    if (!softPath) return;
    const runId = ++runIdRef.current;
    clearTick();
    setPhase("playing");
    setSecondsLeft(0);

    const { ok } = await speakAndWait(demoText, { rate: 0.85 });
    if (runId !== runIdRef.current) return;

    // TTS failed / missing — don't fake a follow window; nudge「再听一遍」.
    if (!ok) {
      setPhase("failed");
      setSecondsLeft(0);
      return;
    }

    let left = followCountdownSeconds(demoText);
    setPhase("following");
    setSecondsLeft(left);

    tickRef.current = window.setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearTick();
        if (runId === runIdRef.current) {
          setSecondsLeft(0);
          setPhase("ready");
        }
        return;
      }
      if (runId === runIdRef.current) {
        setSecondsLeft(left);
      }
    }, 1000);
  }, [clearTick, demoText, softPath]);

  const canConfirm = !softPath || phase === "ready";
  const ritualBusy = phase === "playing" || phase === "following";

  return {
    softPath,
    phase,
    secondsLeft,
    canConfirm,
    ritualBusy,
    startRitual,
    reset,
  };
}
