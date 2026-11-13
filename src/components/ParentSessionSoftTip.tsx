"use client";

import { useState } from "react";

import {
  ParentSessionTipChoice,
  clearParentSessionTip,
  parentSessionTipLabel,
  readParentSessionTip,
  writeParentSessionTip,
} from "@/lib/parentSessionTip";

const CHOICES: ParentSessionTipChoice[] = [10, 20, 30, "skip"];

/**
 * MW-69 / Ship E: optional local soft tip 「今晚玩多久」— reminder only, not a lock.
 */
export function ParentSessionSoftTip() {
  const [tip, setTip] = useState(() => readParentSessionTip());

  function choose(choice: ParentSessionTipChoice) {
    setTip(writeParentSessionTip(choice));
  }

  function resetForTonight() {
    clearParentSessionTip();
    setTip(null);
  }

  if (tip) {
    return (
      <section
        className="mw-parent-session-tip mw-parent-session-tip-set"
        aria-labelledby="mw-parent-session-tip"
      >
        <h2 id="mw-parent-session-tip" className="sr-only">
          今晚玩多久
        </h2>
        <p className="text-sm font-bold" role="status">
          {parentSessionTipLabel(tip.choice)}
          <span className="mt-0.5 block text-xs font-semibold text-muted">
            只是提醒，时间到了也不会锁游戏。
          </span>
        </p>
        <button
          type="button"
          className="mt-2 text-xs font-bold text-primary underline underline-offset-2"
          onClick={resetForTonight}
        >
          改一下
        </button>
      </section>
    );
  }

  return (
    <section
      className="mw-parent-session-tip"
      aria-labelledby="mw-parent-session-tip"
    >
      <h2 id="mw-parent-session-tip" className="text-base font-black">
        今晚玩多久？
      </h2>
      <p className="mt-1 text-xs font-semibold text-muted">
        选个大概时长当软提示——不是作业闹钟，也不会强锁。
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {CHOICES.map((choice) => (
          <button
            key={String(choice)}
            type="button"
            onClick={() => choose(choice)}
            className="inline-flex min-h-10 items-center rounded-md border border-[var(--panel-wood)]/60 bg-black/20 px-3 py-1.5 text-sm font-bold text-primary hover:bg-black/35"
          >
            {choice === "skip" ? "先不设" : `${choice} 分钟`}
          </button>
        ))}
      </div>
    </section>
  );
}
