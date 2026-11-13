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

/**
 * Play TTS and resolve when the utterance ends (or on a safe fallback timeout).
 * Used by the no-mic follow-then-confirm soft path (MW-42).
 */
export function speakAndWait(
  text: string,
  options?: {
    rate?: number;
  },
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      resolve();
      return;
    }

    if (!window.speechSynthesis) {
      window.setTimeout(resolve, 600);
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(fallbackTimer);
      resolve();
    };

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = "en-US";
    utterance.rate = options?.rate ?? 0.85;
    utterance.onend = finish;
    utterance.onerror = finish;

    // Some browsers never fire onend; cover with word-length fallback.
    const wordCount = Math.max(1, trimmed.split(/\s+/).filter(Boolean).length);
    const fallbackMs = Math.min(8000, Math.max(1800, wordCount * 550 + 1200));
    const fallbackTimer = window.setTimeout(finish, fallbackMs);

    window.speechSynthesis.speak(utterance);
  });
}
