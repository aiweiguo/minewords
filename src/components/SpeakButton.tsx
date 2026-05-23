"use client";

import { speak } from "@/lib/speak";

type SpeakButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

export function SpeakButton({
  text,
  label = "Play Sound 听发音",
  className = "",
}: SpeakButtonProps) {
  return (
    <button
      type="button"
      onClick={() => speak(text)}
      className={`mw-btn mw-btn-accent ${className}`}
      aria-label={`Play pronunciation for ${text}`}
    >
      🔊 {label}
    </button>
  );
}
