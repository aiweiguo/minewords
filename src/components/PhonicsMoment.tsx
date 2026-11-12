"use client";

import { useEffect, useRef, useState } from "react";

import { SpeakButton } from "@/components/SpeakButton";
import {
  getPhonicsPlan,
  phonicsChunkKey,
  scorePhonicsRepeatAttempt,
} from "@/lib/phonics";
import { speak } from "@/lib/speak";
import {
  isSpeechRecognitionSupported,
  listenOnce,
} from "@/lib/speechRecognition";
import { useGameStore } from "@/store/useGameStore";

type PhonicsMomentProps = {
  wordId: string;
  /** Play verb to return to after the mini-learn. */
  resumeLabelCn: string;
  resumeLabelEn: string;
  /** Optional reason line (e.g. miss → learn). */
  reasonCn?: string;
  reasonEn?: string;
  onComplete: (wordId: string) => void;
  onSkip?: () => void;
};

/** Brief hold so kids see “学会了” before returning to the play verb. */
const COMPLETE_HOLD_MS = 900;

/**
 * Embedded phonics mini-learn (MW-21 / MW-33): listen + sound chunks + repeat,
 * then return to attack / craft / trade — not a separate drill home.
 * Reuses dictionary phonetic IPA (top-level + compound parts).
 */
export function PhonicsMoment({
  wordId,
  resumeLabelCn,
  resumeLabelEn,
  reasonCn,
  reasonEn,
  onComplete,
  onSkip,
}: PhonicsMomentProps) {
  const plan = getPhonicsPlan(wordId);
  const markWordLearned = useGameStore((s) => s.markWordLearned);
  const discoverWord = useGameStore((s) => s.discoverWord);
  const recordSpeakAttempt = useGameStore((s) => s.recordSpeakAttempt);

  const [listening, setListening] = useState(false);
  const [activeChunk, setActiveChunk] = useState<number | null>(null);
  const [heard, setHeard] = useState<string | null>(null);
  const [passed, setPassed] = useState(false);
  const [supported, setSupported] = useState(false);
  const completeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    setListening(false);
    setActiveChunk(null);
    setHeard(null);
    setPassed(false);
    if (completeTimerRef.current != null) {
      window.clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    }
    const demo = getPhonicsPlan(wordId)?.demoText;
    if (!demo) return undefined;
    // Soft auto-play so kids hear the new word once when the moment opens.
    const timer = window.setTimeout(() => speak(demo, { rate: 0.75 }), 280);
    return () => {
      window.clearTimeout(timer);
      if (completeTimerRef.current != null) {
        window.clearTimeout(completeTimerRef.current);
        completeTimerRef.current = null;
      }
    };
  }, [wordId]);

  if (!plan) return null;

  const showPartPhonetics =
    plan.parts.length > 1 && plan.parts.some((part) => part.phonetic);

  function playChunk(index: number) {
    const chunk = plan!.chunks[index];
    if (!chunk || !chunk.say) return;
    setActiveChunk(index);
    speak(chunk.say, { rate: 0.55 });
    window.setTimeout(() => setActiveChunk(null), 450);
  }

  function playAllChunks() {
    const chunks = plan!.chunks.filter((c) => c.say);
    let delay = 0;
    chunks.forEach((chunk, index) => {
      window.setTimeout(() => {
        setActiveChunk(plan!.chunks.indexOf(chunk));
        speak(chunk.say, { rate: 0.55 });
        if (index === chunks.length - 1) {
          window.setTimeout(() => {
            setActiveChunk(null);
            speak(plan!.demoText, { rate: 0.75 });
          }, 420);
        }
      }, delay);
      delay += 520;
    });
  }

  function finishLearn() {
    discoverWord(wordId);
    markWordLearned(wordId);
    setPassed(true);
    if (completeTimerRef.current != null) {
      window.clearTimeout(completeTimerRef.current);
    }
    // Hold success flash, then hand control back to attack/craft/trade.
    completeTimerRef.current = window.setTimeout(() => {
      completeTimerRef.current = null;
      onComplete(wordId);
    }, COMPLETE_HOLD_MS);
  }

  async function handleRepeat() {
    setListening(true);
    setHeard(null);
    recordSpeakAttempt();
    try {
      const { transcript } = await listenOnce();
      setHeard(transcript);
      const score = scorePhonicsRepeatAttempt(transcript, plan!.english);
      if (score.passed) {
        finishLearn();
      }
    } catch {
      setHeard("没听清楚，再试一次吧。");
    } finally {
      setListening(false);
    }
  }

  function handleManualRepeat() {
    recordSpeakAttempt();
    setHeard("手动确认：我跟读了。");
    finishLearn();
  }

  return (
    <div className="mw-phonics" role="region" aria-label="Phonics mini-learn">
      <div className="mw-phonics-head">
        <p className="mw-phonics-eyebrow">生词短学 · Phonics</p>
        <h3 className="mw-phonics-word">{plan.english}</h3>
        <p className="mw-phonics-cn">{plan.chinese}</p>
        {plan.phonetic ? (
          <p className="mw-phonics-ipa">{plan.phonetic}</p>
        ) : null}
        {showPartPhonetics ? (
          <ul className="mw-phonics-parts" aria-label="Dictionary phonetics">
            {plan.parts.map((part) => (
              <li key={part.word} className="mw-phonics-part">
                <span className="mw-phonics-part-word">{part.word}</span>
                {part.phonetic ? (
                  <span className="mw-phonics-part-ipa">{part.phonetic}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        {reasonCn ? (
          <p className="mw-phonics-reason">
            {reasonCn}
            {reasonEn ? (
              <>
                <br />
                <span className="text-muted">{reasonEn}</span>
              </>
            ) : null}
          </p>
        ) : (
          <p className="mw-phonics-reason">
            先听一听、跟读一下，再回去开口玩！
            <br />
            <span className="text-muted">
              Listen, tap the sounds, repeat — then back to play.
            </span>
          </p>
        )}
      </div>

      <div className="mw-phonics-chunks" aria-label="Sound chunks">
        {plan.chunks.map((chunk, index) =>
          chunk.grapheme === "·" ? (
            <span key={phonicsChunkKey(chunk, index)} className="mw-phonics-gap">
              ·
            </span>
          ) : (
            <button
              key={phonicsChunkKey(chunk, index)}
              type="button"
              className={`mw-phonics-chunk ${
                activeChunk === index ? "mw-phonics-chunk-active" : ""
              }`}
              onClick={() => playChunk(index)}
              aria-label={`Play sound chunk ${chunk.grapheme}`}
            >
              {chunk.grapheme}
            </button>
          ),
        )}
      </div>

      <div className="mw-phonics-actions">
        <SpeakButton text={plan.demoText} label="听单词 Listen" />
        <button
          type="button"
          className="mw-btn mw-btn-outline"
          onClick={playAllChunks}
        >
          听音块 Sounds
        </button>
      </div>

      <div className="mw-phonics-repeat space-y-2">
        {supported ? (
          <button
            type="button"
            disabled={listening || passed}
            onClick={handleRepeat}
            className="mw-btn mw-btn-secondary w-full disabled:opacity-60"
          >
            {listening
              ? "正在听… Listening…"
              : passed
                ? "跟读成功 ✓"
                : "🎤 跟读 Repeat"}
          </button>
        ) : null}
        <button
          type="button"
          disabled={listening || passed}
          onClick={handleManualRepeat}
          className={`mw-btn w-full disabled:opacity-60 ${
            supported ? "mw-btn-outline" : "mw-btn-secondary"
          }`}
        >
          我跟读了 I repeated it
        </button>
      </div>

      {heard && !passed ? (
        <p className="mw-phonics-feedback mw-phonics-feedback-miss">
          再试一次！Try again.
          <br />
          听到：{heard}
        </p>
      ) : null}

      {passed ? (
        <p className="mw-phonics-feedback mw-phonics-feedback-ok">
          学会了！继续{resumeLabelCn}
          <br />
          <span className="text-xs opacity-90">
            Learned — back to {resumeLabelEn}
          </span>
        </p>
      ) : null}

      {onSkip && !passed ? (
        <button
          type="button"
          className="mw-phonics-skip"
          onClick={onSkip}
        >
          稍后再学 · Skip for now
        </button>
      ) : null}
    </div>
  );
}
