import type { GameState } from "@/types";

/** Matches zustand persist `name` in useGameStore. */
export const GAME_STATE_STORAGE_KEY = "minewords-game-state";

export const PROGRESS_BACKUP_FORMAT = "minewords-game-state" as const;
export const PROGRESS_BACKUP_VERSION = 1;

/** Fields written by zustand `partialize` — keep in sync with useGameStore. */
export type PersistedGameSlice = Pick<
  GameState,
  | "playerName"
  | "xp"
  | "resources"
  | "roomBlocks"
  | "selectedExploreZoneId"
  | "completedQuestIds"
  | "errandProgress"
  | "unlockedIds"
  | "masteredWordIds"
  | "discoveredWordIds"
  | "learnedWordIds"
  | "completedGuideIds"
  | "completedBuildIdeaIds"
  | "completedSpeakIds"
  | "wrongWordCounts"
  | "defeatedMonsterIds"
  | "learningStreak"
  | "lastActiveDate"
  | "dailyStats"
  | "weekSpeakStats"
  | "hasSeenOnboarding"
>;

export type ProgressBackupEnvelope = {
  format: typeof PROGRESS_BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  state: PersistedGameSlice;
};

export function partializeGameState(state: GameState): PersistedGameSlice {
  return {
    playerName: state.playerName,
    xp: state.xp,
    resources: state.resources,
    roomBlocks: state.roomBlocks,
    selectedExploreZoneId: state.selectedExploreZoneId,
    completedQuestIds: state.completedQuestIds,
    errandProgress: state.errandProgress,
    unlockedIds: state.unlockedIds,
    masteredWordIds: state.masteredWordIds,
    discoveredWordIds: state.discoveredWordIds,
    learnedWordIds: state.learnedWordIds,
    completedGuideIds: state.completedGuideIds,
    completedBuildIdeaIds: state.completedBuildIdeaIds,
    completedSpeakIds: state.completedSpeakIds,
    wrongWordCounts: state.wrongWordCounts,
    defeatedMonsterIds: state.defeatedMonsterIds,
    learningStreak: state.learningStreak,
    lastActiveDate: state.lastActiveDate,
    dailyStats: state.dailyStats,
    weekSpeakStats: state.weekSpeakStats,
    hasSeenOnboarding: state.hasSeenOnboarding,
  };
}

export function buildProgressBackupJson(state: GameState): string {
  const envelope: ProgressBackupEnvelope = {
    format: PROGRESS_BACKUP_FORMAT,
    version: PROGRESS_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    state: partializeGameState(state),
  };
  return JSON.stringify(envelope, null, 2);
}

export function progressBackupFilename(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `minewords-progress-${y}-${m}-${d}.json`;
}

export type ParseProgressBackupResult =
  | { ok: true; state: Partial<GameState> }
  | { ok: false; error: string };

function looksLikePersistedSlice(value: unknown): value is Partial<GameState> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  if (typeof obj.playerName === "string") return true;
  if (typeof obj.xp === "number") return true;
  if (obj.resources != null && typeof obj.resources === "object") return true;
  if (Array.isArray(obj.masteredWordIds)) return true;
  if (Array.isArray(obj.learnedWordIds)) return true;
  if (Array.isArray(obj.unlockedIds)) return true;
  if (Array.isArray(obj.completedQuestIds)) return true;
  return false;
}

/**
 * Accepts MineWords backup envelope, raw zustand persist blob, or bare partial state.
 */
export function parseProgressBackup(raw: string): ParseProgressBackupResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "文件是空的，请选择有效的备份 JSON。" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, error: "不是有效的 JSON，请用本页导出的备份文件。" };
  }

  if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "备份格式不对（需要一个 JSON 对象）。" };
  }

  const root = parsed as Record<string, unknown>;

  // Ours: { format, version, exportedAt, state }
  if (root.format === PROGRESS_BACKUP_FORMAT && root.state != null) {
    if (!looksLikePersistedSlice(root.state)) {
      return { ok: false, error: "备份里的 state 不像 MineWords 进度。" };
    }
    return { ok: true, state: root.state };
  }

  // Zustand persist: { state, version }
  if (
    root.state != null &&
    typeof root.state === "object" &&
    !Array.isArray(root.state) &&
    ("version" in root || "state" in root)
  ) {
    if (!looksLikePersistedSlice(root.state)) {
      return { ok: false, error: "localStorage 备份里的 state 不像 MineWords 进度。" };
    }
    return { ok: true, state: root.state as Partial<GameState> };
  }

  // Bare partialized slice
  if (looksLikePersistedSlice(root)) {
    return { ok: true, state: root };
  }

  return {
    ok: false,
    error: "认不出这是 MineWords 进度备份（minewords-game-state）。",
  };
}
