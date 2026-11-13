export function speak(
  text: string,
  options?: {
    /** Speech rate; default 0.85. Phonics chunks use a slower rate. */
    rate?: number;
  },
): void {
  if (typeof window === "undefined") return;
  const trimmed = text.trim();
  if (!trimmed) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.lang = "en-US";
  utterance.rate = options?.rate ?? 0.85;
  window.speechSynthesis.speak(utterance);
}

export type SpeakWaitResult = {
  /** False when TTS errored or speechSynthesis is missing (soft-path retry). */
  ok: boolean;
};

/**
 * Play TTS and resolve when the utterance ends (or on a safe fallback timeout).
 * Used by the no-mic follow-then-confirm soft path (MW-42 / MW-61).
 */
export function speakAndWait(
  text: string,
  options?: {
    rate?: number;
  },
): Promise<SpeakWaitResult> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve({ ok: true });
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      resolve({ ok: true });
      return;
    }

    if (!window.speechSynthesis) {
      // No engine: still allow soft-path countdown (don't soft-lock confirm).
      window.setTimeout(() => resolve({ ok: true }), 600);
      return;
    }

    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(fallbackTimer);
      resolve({ ok });
    };

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = "en-US";
    utterance.rate = options?.rate ?? 0.85;
    utterance.onend = () => finish(true);
    utterance.onerror = () => finish(false);

    // Some browsers never fire onend; cover with word-length fallback.
    const wordCount = Math.max(1, trimmed.split(/\s+/).filter(Boolean).length);
    const fallbackMs = Math.min(8000, Math.max(1800, wordCount * 550 + 1200));
    const fallbackTimer = window.setTimeout(() => finish(true), fallbackMs);

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      finish(false);
    }
  });
}
