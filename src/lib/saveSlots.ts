import type { GameState } from "@/types";
import {
  GAME_STATE_STORAGE_KEY,
  partializeGameState,
  type PersistedGameSlice,
} from "@/lib/progressBackup";
import { summarizeProgress, type ProgressSummary } from "@/lib/progressSummary";

/** Meta registry for sibling / multi-child local saves (MW-59). */
export const SAVE_SLOTS_META_KEY = "minewords-save-slots";
export const SAVE_SLOTS_META_VERSION = 1;

export const SAVE_SLOT_IDS = ["1", "2", "3"] as const;
export type SaveSlotId = (typeof SAVE_SLOT_IDS)[number];

export type SaveSlotMeta = {
  id: SaveSlotId;
  /** Parent-facing label; usually mirrors playerName when active. */
  label: string;
  /** ISO timestamp of last snapshot write; null = never used / empty. */
  updatedAt: string | null;
};

export type SaveSlotsRegistry = {
  version: number;
  activeSlotId: SaveSlotId;
  slots: SaveSlotMeta[];
};

export function isSaveSlotId(value: unknown): value is SaveSlotId {
  return SAVE_SLOT_IDS.includes(value as SaveSlotId);
}

/** Inactive shelves — active game stays on GAME_STATE_STORAGE_KEY. */
export function slotSnapshotStorageKey(slotId: SaveSlotId): string {
  return `${GAME_STATE_STORAGE_KEY}__slot_${slotId}`;
}

function defaultLabel(slotId: SaveSlotId): string {
  return `档位 ${slotId}`;
}

export function createDefaultSaveSlotsRegistry(
  activeLabel = "Alex",
): SaveSlotsRegistry {
  return {
    version: SAVE_SLOTS_META_VERSION,
    activeSlotId: "1",
    slots: SAVE_SLOT_IDS.map((id) => ({
      id,
      label: id === "1" ? activeLabel.slice(0, 24) || defaultLabel(id) : defaultLabel(id),
      updatedAt: id === "1" ? new Date().toISOString() : null,
    })),
  };
}

function normalizeRegistry(raw: unknown, fallbackLabel: string): SaveSlotsRegistry {
  const fallback = createDefaultSaveSlotsRegistry(fallbackLabel);
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return fallback;
  }
  const obj = raw as Record<string, unknown>;
  const activeSlotId = isSaveSlotId(obj.activeSlotId) ? obj.activeSlotId : "1";
  const slotsRaw = Array.isArray(obj.slots) ? obj.slots : [];
  const byId = new Map<string, SaveSlotMeta>();
  for (const entry of slotsRaw) {
    if (entry == null || typeof entry !== "object" || Array.isArray(entry)) continue;
    const row = entry as Record<string, unknown>;
    if (!isSaveSlotId(row.id)) continue;
    const label =
      typeof row.label === "string" && row.label.trim().length > 0
        ? row.label.trim().slice(0, 24)
        : defaultLabel(row.id);
    const updatedAt =
      typeof row.updatedAt === "string" && row.updatedAt.length > 0
        ? row.updatedAt
        : null;
    byId.set(row.id, { id: row.id, label, updatedAt });
  }

  return {
    version: SAVE_SLOTS_META_VERSION,
    activeSlotId,
    slots: SAVE_SLOT_IDS.map(
      (id) =>
        byId.get(id) ?? {
          id,
          label: id === "1" ? fallbackLabel.slice(0, 24) || defaultLabel(id) : defaultLabel(id),
          updatedAt: id === activeSlotId ? new Date().toISOString() : null,
        },
    ),
  };
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readSaveSlotsRegistry(fallbackLabel = "Alex"): SaveSlotsRegistry {
  if (!canUseStorage()) {
    return createDefaultSaveSlotsRegistry(fallbackLabel);
  }
  try {
    const raw = window.localStorage.getItem(SAVE_SLOTS_META_KEY);
    if (!raw) {
      return createDefaultSaveSlotsRegistry(fallbackLabel);
    }
    return normalizeRegistry(JSON.parse(raw), fallbackLabel);
  } catch {
    return createDefaultSaveSlotsRegistry(fallbackLabel);
  }
}

export function writeSaveSlotsRegistry(registry: SaveSlotsRegistry): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SAVE_SLOTS_META_KEY, JSON.stringify(registry));
}

/** Ensure meta exists for existing single-save installs (no data migration needed). */
export function ensureSaveSlotsRegistry(activeLabel = "Alex"): SaveSlotsRegistry {
  if (!canUseStorage()) {
    return createDefaultSaveSlotsRegistry(activeLabel);
  }
  const existing = window.localStorage.getItem(SAVE_SLOTS_META_KEY);
  if (existing) {
    const registry = normalizeRegistry(
      (() => {
        try {
          return JSON.parse(existing);
        } catch {
          return null;
        }
      })(),
      activeLabel,
    );
    writeSaveSlotsRegistry(registry);
    return registry;
  }
  const created = createDefaultSaveSlotsRegistry(activeLabel);
  writeSaveSlotsRegistry(created);
  return created;
}

export function readSlotSnapshot(
  slotId: SaveSlotId,
): Partial<GameState> | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(slotSnapshotStorageKey(slotId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const root = parsed as Record<string, unknown>;
    // Zustand-shaped shelf: { state, version }
    if (root.state != null && typeof root.state === "object" && !Array.isArray(root.state)) {
      return root.state as Partial<GameState>;
    }
    return parsed as Partial<GameState>;
  } catch {
    return null;
  }
}

export function writeSlotSnapshot(
  slotId: SaveSlotId,
  state: PersistedGameSlice | Partial<GameState>,
): void {
  if (!canUseStorage()) return;
  const payload = {
    state,
    version: 0,
  };
  window.localStorage.setItem(
    slotSnapshotStorageKey(slotId),
    JSON.stringify(payload),
  );
}

export function clearSlotSnapshot(slotId: SaveSlotId): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(slotSnapshotStorageKey(slotId));
}

export function syncActiveSlotLabel(label: string): SaveSlotsRegistry {
  const trimmed = label.trim().slice(0, 24) || "Alex";
  const registry = ensureSaveSlotsRegistry(trimmed);
  const next: SaveSlotsRegistry = {
    ...registry,
    slots: registry.slots.map((slot) =>
      slot.id === registry.activeSlotId
        ? { ...slot, label: trimmed, updatedAt: new Date().toISOString() }
        : slot,
    ),
  };
  writeSaveSlotsRegistry(next);
  return next;
}

export type SlotRowView = {
  id: SaveSlotId;
  label: string;
  active: boolean;
  empty: boolean;
  updatedAt: string | null;
  summary: ProgressSummary | null;
};

export function buildSlotRowViews(
  registry: SaveSlotsRegistry,
  activeState: GameState,
): SlotRowView[] {
  return registry.slots.map((slot) => {
    const active = slot.id === registry.activeSlotId;
    if (active) {
      const summary = summarizeProgress(activeState);
      return {
        id: slot.id,
        label: summary.playerName || slot.label,
        active: true,
        empty: false,
        updatedAt: slot.updatedAt,
        summary,
      };
    }
    const snap = readSlotSnapshot(slot.id);
    if (!snap) {
      return {
        id: slot.id,
        label: slot.label,
        active: false,
        empty: true,
        updatedAt: null,
        summary: null,
      };
    }
    return {
      id: slot.id,
      label: slot.label,
      active: false,
      empty: false,
      updatedAt: slot.updatedAt,
      summary: summarizeProgress(snap),
    };
  });
}

export type SwitchSlotResult =
  | {
      ok: true;
      registry: SaveSlotsRegistry;
      /** State to load into the live store; null means reset to a fresh save. */
      loadState: Partial<GameState> | null;
    }
  | { ok: false; error: string };

/**
 * Persist the live game into the current slot shelf, then prepare the target.
 * Caller must apply `loadState` via importProgress, or resetProgress when null.
 */
export function prepareSwitchSlot(
  targetId: SaveSlotId,
  liveState: GameState,
): SwitchSlotResult {
  if (!isSaveSlotId(targetId)) {
    return { ok: false, error: "无效档位。" };
  }

  const registry = ensureSaveSlotsRegistry(liveState.playerName);
  if (registry.activeSlotId === targetId) {
    return { ok: true, registry, loadState: partializeGameState(liveState) };
  }

  const now = new Date().toISOString();
  const liveSlice = partializeGameState(liveState);
  writeSlotSnapshot(registry.activeSlotId, liveSlice);

  const targetSnap = readSlotSnapshot(targetId);
  const nextSlots = registry.slots.map((slot) => {
    if (slot.id === registry.activeSlotId) {
      return {
        ...slot,
        label: liveState.playerName?.trim().slice(0, 24) || slot.label,
        updatedAt: now,
      };
    }
    if (slot.id === targetId) {
      const fromSnap =
        typeof targetSnap?.playerName === "string" &&
        targetSnap.playerName.trim().length > 0
          ? targetSnap.playerName.trim().slice(0, 24)
          : null;
      return {
        ...slot,
        label: fromSnap ?? slot.label,
        updatedAt: targetSnap ? (slot.updatedAt ?? now) : now,
      };
    }
    return slot;
  });

  const next: SaveSlotsRegistry = {
    ...registry,
    activeSlotId: targetId,
    slots: nextSlots,
  };
  writeSaveSlotsRegistry(next);

  return {
    ok: true,
    registry: next,
    loadState: targetSnap,
  };
}

/** After reset/import on the active slot, refresh meta timestamps / labels. */
export function touchActiveSlot(liveState: GameState): SaveSlotsRegistry {
  const registry = ensureSaveSlotsRegistry(liveState.playerName);
  const now = new Date().toISOString();
  const next: SaveSlotsRegistry = {
    ...registry,
    slots: registry.slots.map((slot) =>
      slot.id === registry.activeSlotId
        ? {
            ...slot,
            label: liveState.playerName?.trim().slice(0, 24) || slot.label,
            updatedAt: now,
          }
        : slot,
    ),
  };
  writeSaveSlotsRegistry(next);
  // Keep shelf copy in sync so a crash mid-switch is less likely to lose the active slot.
  writeSlotSnapshot(registry.activeSlotId, partializeGameState(liveState));
  return next;
}
