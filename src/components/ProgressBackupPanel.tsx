"use client";

import { useRef, useState } from "react";

import {
  buildProgressBackupJson,
  parseProgressBackup,
  progressBackupFilename,
} from "@/lib/progressBackup";
import { useGameStore } from "@/store/useGameStore";

type Status =
  | { kind: "idle" }
  | { kind: "ok"; message: string }
  | { kind: "err"; message: string };

export function ProgressBackupPanel() {
  const importProgress = useGameStore((s) => s.importProgress);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function handleExport() {
    try {
      const json = buildProgressBackupJson(useGameStore.getState());
      const blob = new Blob([json], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = progressBackupFilename();
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus({
        kind: "ok",
        message: "已下载备份文件。换手机或清缓存前请保存好。",
      });
    } catch {
      setStatus({ kind: "err", message: "导出失败，请再试一次。" });
    }
  }

  async function applyBackupText(raw: string) {
    const parsed = parseProgressBackup(raw);
    if (!parsed.ok) {
      setStatus({ kind: "err", message: parsed.error });
      return;
    }

    const confirmed = window.confirm(
      "导入会覆盖本机当前进度，且无法撤销。确定导入吗？",
    );
    if (!confirmed) {
      setStatus({ kind: "idle" });
      return;
    }

    importProgress(parsed.state);
    setStatus({
      kind: "ok",
      message: "导入成功。刷新或回基地即可看到新进度。",
    });
  }

  async function handleFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await applyBackupText(text);
    } catch {
      setStatus({ kind: "err", message: "读文件失败，请换一个 JSON 再试。" });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <section className="mw-card p-5" aria-labelledby="mw-parent-backup">
      <h2 id="mw-parent-backup" className="text-xl font-black">
        进度备份
      </h2>
      <p className="mt-2 text-sm font-semibold leading-relaxed">
        无账号、换机请备份。进度只存在本机浏览器，没有云同步或登录。
      </p>
      <p className="mt-2 text-sm font-semibold text-muted leading-relaxed">
        导出 JSON（minewords-game-state），换设备后在本页导入即可恢复。
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex min-h-11 items-center rounded-md border border-[var(--panel-wood)]/60 bg-black/20 px-4 py-2 text-sm font-bold text-primary hover:bg-black/35"
        >
          导出进度
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex min-h-11 items-center rounded-md border border-[var(--panel-wood)]/60 bg-black/20 px-4 py-2 text-sm font-bold text-primary hover:bg-black/35"
        >
          导入进度
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="选择进度备份 JSON 文件"
          onChange={(event) => handleFileChange(event.target.files)}
        />
      </div>

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
