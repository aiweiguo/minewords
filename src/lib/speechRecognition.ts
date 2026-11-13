type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript?: string; confidence?: number } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}

type RecognitionResult = {
  transcript: string;
  confidence: number;
};

export function listenOnce(timeoutMs = 8000): Promise<RecognitionResult> {
  return new Promise((resolve, reject) => {
    if (!isSpeechRecognitionSupported()) {
      reject(new Error("Speech recognition not supported"));
      return;
    }

    const win = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognition = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      reject(new Error("Speech recognition not supported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      fn();
    };

    const timer = window.setTimeout(() => {
      recognition.stop();
      finish(() => reject(new Error("Timeout")));
    }, timeoutMs);

    recognition.onresult = (event) => {
      const result = event.results[0]?.[0];
      finish(() =>
        resolve({
          transcript: result?.transcript ?? "",
          confidence: result?.confidence ?? 0,
        }),
      );
    };

    recognition.onerror = (event) => {
      finish(() => reject(new Error(event.error)));
    };

    recognition.onend = () => {
      finish(() => reject(new Error("no-speech")));
    };

    recognition.start();
  });
}

export function scoreSpeechAttempt(
  transcript: string,
  expectedText: string,
  keywords: string[],
): { passed: boolean; matchedKeywords: string[] } {
  const normalized = transcript.toLowerCase();
  const matchedKeywords = matchSpeechKeywords(normalized, keywords);
  const expectedMatch = normalized.includes(expectedText.toLowerCase());
  const keywordMatch =
    keywords.length > 0 &&
    matchedKeywords.length >= Math.min(2, keywords.length);
  return {
    passed: expectedMatch || keywordMatch,
    matchedKeywords,
  };
}

/**
 * Keyword hits without double-counting nested stems
 * (e.g. "diamonds" should not count as both "diamond" and "diamonds").
 */
export function matchSpeechKeywords(
  normalizedTranscript: string,
  keywords: string[],
): string[] {
  const hits = keywords.filter((kw) =>
    normalizedTranscript.includes(kw.toLowerCase()),
  );
  const kept: string[] = [];
  for (const kw of [...hits].sort((a, b) => b.length - a.length)) {
    const lower = kw.toLowerCase();
    const nested = kept.some((k) => {
      const keptLower = k.toLowerCase();
      return keptLower.includes(lower) || lower.includes(keptLower);
    });
    if (!nested) kept.push(kw);
  }
  return kept;
}

/**
 * Speak-craft scoring: full phrase OR enough recipe keywords.
 * Early wood/stone stay at 1 keyword (kid-friendly). Post-iron / diamond-path
 * callers pass minKeywords=2 to align with the attack ladder (P2-5 / MW-51).
 * `Math.min` keeps the gate natural when a prompt only has one keyword.
 */
export function scoreCraftSpeechAttempt(
  transcript: string,
  expectedText: string,
  keywords: string[],
  minKeywords = 1,
): { passed: boolean; matchedKeywords: string[] } {
  const normalized = transcript.toLowerCase();
  const matchedKeywords = matchSpeechKeywords(normalized, keywords);
  const expectedMatch = normalized.includes(expectedText.toLowerCase());
  const needed = Math.max(1, Math.min(minKeywords, keywords.length || 1));
  return {
    passed: expectedMatch || matchedKeywords.length >= needed,
    matchedKeywords,
  };
}

/**
 * Speak-trade scoring (MW-20 → MW-51): same contract as craft.
 * Early funnel offers stay at 1 keyword; diamond-path offers use minKeywords=2.
 */
export function scoreTradeSpeechAttempt(
  transcript: string,
  expectedText: string,
  keywords: string[],
  minKeywords = 1,
): { passed: boolean; matchedKeywords: string[] } {
  return scoreCraftSpeechAttempt(
    transcript,
    expectedText,
    keywords,
    minKeywords,
  );
}

/** Post-iron weapon craft (iron + diamond) needs ≥2 keywords. */
export function craftSpeechMinKeywords(weaponId: string): number {
  return weaponId === "iron-sword" || weaponId === "diamond-sword" ? 2 : 1;
}

/** Diamond-path + MW-57 decor trades need ≥2 keywords; wood→emerald stays lenient. */
export function tradeSpeechMinKeywords(offerId: string): number {
  return offerId === "buy-diamonds" ||
    offerId === "iron-for-diamond" ||
    offerId === "boat-for-ocean" ||
    offerId === "bed-to-sleep"
    ? 2
    : 1;
}
