"use client";

import { FollowConfirmPhase } from "@/lib/followConfirm";

type FollowConfirmControlsProps = {
  softPath: boolean;
  phase: FollowConfirmPhase;
  secondsLeft: number;
  canConfirm: boolean;
  ritualBusy: boolean;
  disabled?: boolean;
  confirmLabel: string;
  onStartRitual: () => void;
  onConfirm: () => void;
  /** Extra class for the confirm button (primary vs outline). */
  confirmClassName?: string;
};

/**
 * No-mic UI: 「跟读模式」 + listen/follow ritual, then unlock confirm.
 * Never framed as 「跳过」.
 */
export function FollowConfirmControls({
  softPath,
  phase,
  secondsLeft,
  canConfirm,
  ritualBusy,
  disabled = false,
  confirmLabel,
  onStartRitual,
  onConfirm,
  confirmClassName = "mw-btn-secondary",
}: FollowConfirmControlsProps) {
  if (!softPath) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onConfirm}
        className={`mw-btn w-full disabled:opacity-60 ${confirmClassName}`}
      >
        {confirmLabel}
      </button>
    );
  }

  const startLabel =
    phase === "ready"
      ? "再听一遍 Listen again"
      : phase === "playing"
        ? "播放中… Playing…"
        : phase === "following"
          ? `跟读中… Follow ${secondsLeft}s`
          : "听并跟读 Listen & follow";

  return (
    <div className="mw-follow-confirm space-y-2">
      <p className="mw-follow-mode-badge" role="status">
        跟读模式 Follow mode
      </p>
      <p className="mw-follow-mode-hint">
        先听示范、开口跟读一会儿，再点确认。确认仍可用，但要走完听+跟读。
      </p>
      <button
        type="button"
        disabled={disabled || phase === "playing"}
        onClick={onStartRitual}
        className="mw-btn mw-btn-accent w-full disabled:opacity-60"
      >
        {startLabel}
      </button>
      <button
        type="button"
        disabled={disabled || ritualBusy || !canConfirm}
        onClick={onConfirm}
        className={`mw-btn w-full disabled:opacity-60 ${
          canConfirm ? confirmClassName : "mw-btn-outline"
        }`}
      >
        {canConfirm
          ? confirmLabel
          : phase === "following"
            ? `跟读中… ${secondsLeft}s`
            : "先听并跟读再确认"}
      </button>
    </div>
  );
}
