"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  FollowConfirmPhase,
  MIC_CONFIRM_HOLD_MS,
  bumpMicConfirmStreak,
  getMicConfirmStreak,
  shouldNudgeSpeakMore,
} from "@/lib/followConfirm";

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
 * Mic UI (MW-56): confirm demoted — collapsed + long-press; consecutive
 * demoted confirms nudge「今天多开口打」. Never framed as 「跳过」.
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
      <MicConfirmDemoted
        disabled={disabled}
        confirmLabel={confirmLabel}
        confirmClassName={confirmClassName}
        onConfirm={onConfirm}
      />
    );
  }

  const startLabel =
    phase === "failed" || phase === "ready"
      ? "再听一遍 Listen again"
      : phase === "playing"
        ? "播放中… Playing…"
        : phase === "following"
          ? `跟读中… Follow ${secondsLeft}s`
          : "听并跟读 Listen & follow";

  const hint =
    phase === "failed"
      ? "没听清或播放失败 — 点「再听一遍」，听完再跟读。"
      : phase === "ready"
        ? "可以确认了。没听清？再听一遍再确认。"
        : "先听示范、开口跟读一会儿，再点确认。确认仍可用，但要走完听+跟读。";

  const confirmGateLabel =
    phase === "failed"
      ? "先再听一遍再确认"
      : phase === "following"
        ? `跟读中… ${secondsLeft}s`
        : "先听并跟读再确认";

  return (
    <div className="mw-follow-confirm space-y-2">
      <p className="mw-follow-mode-badge" role="status">
        跟读模式 Follow mode
      </p>
      <p className="mw-follow-mode-hint" role="status">
        {hint}
      </p>
      <button
        type="button"
        disabled={disabled || phase === "playing"}
        onClick={onStartRitual}
        className={`mw-btn w-full disabled:opacity-60 ${
          phase === "failed" ? "mw-btn-primary" : "mw-btn-accent"
        }`}
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
        {canConfirm ? confirmLabel : confirmGateLabel}
      </button>
    </div>
  );
}

type MicConfirmDemotedProps = {
  disabled: boolean;
  confirmLabel: string;
  confirmClassName: string;
  onConfirm: () => void;
};

function MicConfirmDemoted({
  disabled,
  confirmLabel,
  confirmClassName,
  onConfirm,
}: MicConfirmDemotedProps) {
  const [expanded, setExpanded] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [nudge, setNudge] = useState(() =>
    shouldNudgeSpeakMore(getMicConfirmStreak()),
  );
  const holdTimerRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const firedRef = useRef(false);

  const clearHold = useCallback(() => {
    if (holdTimerRef.current != null) {
      window.cancelAnimationFrame(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    holdStartRef.current = null;
    firedRef.current = false;
    setHoldProgress(0);
  }, []);

  useEffect(() => () => clearHold(), [clearHold]);

  useEffect(() => {
    if (disabled) clearHold();
  }, [disabled, clearHold]);

  const fireConfirm = useCallback(() => {
    if (firedRef.current || disabled) return;
    firedRef.current = true;
    clearHold();
    const streak = bumpMicConfirmStreak();
    setNudge(shouldNudgeSpeakMore(streak));
    onConfirm();
  }, [clearHold, disabled, onConfirm]);

  const tickHold = useCallback(() => {
    const start = holdStartRef.current;
    if (start == null) return;
    const elapsed = performance.now() - start;
    const progress = Math.min(1, elapsed / MIC_CONFIRM_HOLD_MS);
    setHoldProgress(progress);
    if (progress >= 1) {
      fireConfirm();
      return;
    }
    holdTimerRef.current = window.requestAnimationFrame(tickHold);
  }, [fireConfirm]);

  const startHold = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (disabled) return;
      event.preventDefault();
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // ignore
      }
      clearHold();
      holdStartRef.current = performance.now();
      holdTimerRef.current = window.requestAnimationFrame(tickHold);
    },
    [clearHold, disabled, tickHold],
  );

  if (!expanded) {
    return (
      <div className="mw-mic-confirm-demoted space-y-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setExpanded(true)}
          className="mw-mic-confirm-collapse text-left text-xs font-bold text-muted underline underline-offset-2 disabled:opacity-60"
        >
          不用麦？展开确认（需长按）
        </button>
        {nudge ? (
          <p className="mw-mic-confirm-nudge" role="status">
            今天多开口打
          </p>
        ) : null}
      </div>
    );
  }

  const holdPct = Math.round(holdProgress * 100);

  return (
    <div className="mw-mic-confirm-demoted space-y-2">
      <p className="mw-follow-mode-hint">
        有麦克风时请优先开口。确认已降为次级：按住约 1
        秒才过关（不是点一下）。
      </p>
      <button
        type="button"
        disabled={disabled}
        onPointerDown={startHold}
        onPointerUp={clearHold}
        onPointerCancel={clearHold}
        onPointerLeave={clearHold}
        onContextMenu={(event) => event.preventDefault()}
        className={`mw-btn mw-mic-confirm-hold w-full disabled:opacity-60 ${confirmClassName}`}
        style={{ ["--mw-hold-progress" as string]: `${holdPct}%` }}
        aria-label={`${confirmLabel}（长按确认）`}
      >
        <span className="mw-mic-confirm-hold-label">
          {holdProgress > 0
            ? `按住确认… ${holdPct}%`
            : `按住确认 · ${confirmLabel}`}
        </span>
      </button>
      <button
        type="button"
        className="text-xs font-bold text-muted underline underline-offset-2"
        onClick={() => {
          clearHold();
          setExpanded(false);
        }}
      >
        收起
      </button>
      {nudge ? (
        <p className="mw-mic-confirm-nudge" role="status">
          今天多开口打
        </p>
      ) : null}
    </div>
  );
}
