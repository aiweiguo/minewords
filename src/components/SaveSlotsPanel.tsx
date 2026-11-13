"use client";

import { useEffect, useState } from "react";

import { formatProgressSummaryLines } from "@/lib/progressSummary";
import {
  buildSlotRowViews,
  ensureSaveSlotsRegistry,
  prepareSwitchSlot,
  readSaveSlotsRegistry,
  touchActiveSlot,
  type SaveSlotId,
} from "@/lib/saveSlots";
import { useGameStore } from "@/store/useGameStore";

type Status =
  | { kind: "idle" }
  | { kind: "ok"; message: string }
  | { kind: "err"; message: string };

export function SaveSlotsPanel() {
  const playerName = useGameStore((s) => s.playerName);
  const xp = useGameStore((s) => s.xp);
  const unlockedIds = useGameStore((s) => s.unlockedIds);
  const roomBlocks = useGameStore((s) => s.roomBlocks);
  const importProgress = useGameStore((s) => s.importProgress);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const setPlayerName = useGameStore((s) => s.setPlayerName);

  const [hydrated, setHydrated] = useState(false);
  /** Bumped after shelf writes so inactive-row summaries re-read localStorage. */
  const [shelfEpoch, setShelfEpoch] = useState(0);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pendingSwitch, setPendingSwitch] = useState<SaveSlotId | null>(null);

  useEffect(() => {
    const persistApi = useGameStore.persist;
    const finish = () => {
      const live = useGameStore.getState();
      ensureSaveSlotsRegistry(live.playerName);
      touchActiveSlot(live);
      setHydrated(true);
      setShelfEpoch((value) => value + 1);
    };
    if (persistApi.hasHydrated()) {
      queueMicrotask(finish);
      return;
    }
    return persistApi.onFinishHydration(() => {
      queueMicrotask(finish);
    });
  }, []);

  const rows =
    hydrated
      ? buildSlotRowViews(
          readSaveSlotsRegistry(playerName),
          useGameStore.getState(),
        )
      : [];
  // Re-read when live progress or shelves change.
  void shelfEpoch;
  void xp;
  void unlockedIds;
  void roomBlocks;

  function confirmSwitch(targetId: SaveSlotId) {
    const live = useGameStore.getState();
    const prepared = prepareSwitchSlot(targetId, live);
    if (!prepared.ok) {
      setStatus({ kind: "err", message: prepared.error });
      setPendingSwitch(null);
      return;
    }

    if (prepared.loadState == null) {
      resetProgress();
      const label =
        prepared.registry.slots.find((s) => s.id === targetId)?.label ?? "Alex";
      if (label && !/^档位\s*\d+$/.test(label)) {
        setPlayerName(label);
      }
      touchActiveSlot(useGameStore.getState());
      setStatus({
        kind: "ok",
        message: `已切换到空档「${label}」。这是新进度，可改称呼后给另一个孩子玩。`,
      });
    } else {
      importProgress(prepared.loadState);
      touchActiveSlot(useGameStore.getState());
      const name = useGameStore.getState().playerName;
      setStatus({
        kind: "ok",
        message: `已切换到「${name}」的档位。回基地即可继续。`,
      });
    }

    setPendingSwitch(null);
    setShelfEpoch((value) => value + 1);
  }

  function requestSwitch(targetId: SaveSlotId) {
    if (!hydrated) return;
    const row = rows.find((r) => r.id === targetId);
    if (!row || row.active) return;
    setPendingSwitch(targetId);
    setStatus({ kind: "idle" });
  }

  const pendingRow = pendingSwitch
    ? rows.find((r) => r.id === pendingSwitch)
    : null;

  return (
    <section className="mw-card p-5" aria-labelledby="mw-parent-slots">
      <h2 id="mw-parent-slots" className="text-xl font-black">
        本机多档（兄弟姐妹）
      </h2>
      <p className="mt-2 text-sm font-semibold leading-relaxed">
        仍无账号、无云同步。同一浏览器里最多 3 个本地档，切换只在家长页；孩子基地保持简单。
      </p>
      <p className="mt-2 text-sm font-semibold text-muted leading-relaxed">
        切换前会自动把当前进度留在原档位。换手机请仍用下方「导出进度」。
      </p>

      {!hydrated ? (
        <p className="mt-4 text-sm text-muted">正在读取本机档位…</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className={`rounded-xl border px-4 py-3 ${
                row.active
                  ? "border-primary/70 bg-black/35"
                  : "border-[var(--panel-wood)]/50 bg-black/20"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black">
                    {row.label}
                    {row.active ? (
                      <span className="ml-2 text-xs font-bold text-primary">
                        当前
                      </span>
                    ) : null}
                  </p>
                  {row.empty ? (
                    <p className="mt-1 text-sm font-semibold text-muted">
                      空档 · 可开新档给另一个孩子
                    </p>
                  ) : row.summary ? (
                    <p className="mt-1 text-sm font-semibold text-muted">
                      Lv {row.summary.level} · {row.summary.weaponLabelCn} · 家装{" "}
                      {row.summary.homeFillLabelCn}
                    </p>
                  ) : null}
                </div>
                {!row.active ? (
                  <button
                    type="button"
                    onClick={() => requestSwitch(row.id)}
                    className="inline-flex min-h-11 items-center rounded-md border border-[var(--panel-wood)]/60 bg-black/20 px-4 py-2 text-sm font-bold text-primary hover:bg-black/35"
                  >
                    {row.empty ? "开新档" : "切换到此档"}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {pendingRow ? (
        <div
          className="mt-4 rounded-xl border border-amber-700/50 bg-amber-950/30 px-4 py-3"
          role="dialog"
          aria-labelledby="mw-slot-switch-title"
        >
          <p id="mw-slot-switch-title" className="text-sm font-black">
            {pendingRow.empty
              ? `确认开新档「${pendingRow.label}」？`
              : `确认切换到「${pendingRow.label}」？`}
          </p>
          <p className="mt-2 text-sm font-semibold text-muted">
            当前进度会留在本机原档位，不会上传。
          </p>
          {pendingRow.summary ? (
            <ul className="mt-2 space-y-1 text-sm font-semibold">
              {formatProgressSummaryLines(pendingRow.summary).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm font-semibold">
              新档从零开始（称呼可在上方改）。
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => confirmSwitch(pendingRow.id)}
              className="inline-flex min-h-11 items-center rounded-md border border-[var(--panel-wood)]/60 bg-black/20 px-4 py-2 text-sm font-bold text-primary hover:bg-black/35"
            >
              确定切换
            </button>
            <button
              type="button"
              onClick={() => setPendingSwitch(null)}
              className="inline-flex min-h-11 items-center rounded-md border border-[var(--panel-wood)]/40 bg-transparent px-4 py-2 text-sm font-bold text-muted hover:bg-black/20"
            >
              取消
            </button>
          </div>
        </div>
      ) : null}

      {status.kind !== "idle" ? (
        <p
          className={`mt-4 rounded-xl px-4 py-3 text-sm font-black ${
            status.kind === "ok"
              ? "bg-green-900/30 text-green-100"
              : "bg-amber-900/40 text-amber-100"
          }`}
          role="status"
        >
          {status.message}
        </p>
      ) : null}
    </section>
  );
}
