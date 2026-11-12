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
