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

    const timer = window.setTimeout(() => {
      recognition.stop();
      reject(new Error("Timeout"));
    }, timeoutMs);

    recognition.onresult = (event) => {
      window.clearTimeout(timer);
      const result = event.results[0]?.[0];
      resolve({
        transcript: result?.transcript ?? "",
        confidence: result?.confidence ?? 0,
      });
    };

    recognition.onerror = (event) => {
      window.clearTimeout(timer);
      reject(new Error(event.error));
    };

    recognition.onend = () => {
      window.clearTimeout(timer);
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
  const matchedKeywords = keywords.filter((kw) => normalized.includes(kw.toLowerCase()));
  const expectedMatch = normalized.includes(expectedText.toLowerCase());
  const keywordMatch = matchedKeywords.length >= Math.min(2, keywords.length);
  return {
    passed: expectedMatch || keywordMatch,
    matchedKeywords,
  };
}
