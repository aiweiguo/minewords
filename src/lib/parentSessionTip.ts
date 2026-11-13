/**
 * MW-69 / Ship E: local soft tip for "今晚玩多久" — reminder only, never a lock.
 */

import { getTodayDateString } from "@/lib/dailyAdventure";

export const PARENT_SESSION_TIP_KEY = "mw-parent-session-tip-v1";

export type ParentSessionTipChoice = 10 | 20 | 30 | "skip";

export type ParentSessionTipState = {
  date: string;
  /** Minutes chosen, or "skip" if parent dismissed for tonight. */
  choice: ParentSessionTipChoice;
};

export function readParentSessionTip(
  storage: Pick<Storage, "getItem"> | null = typeof window !== "undefined"
    ? window.localStorage
    : null,
  today: string = getTodayDateString(),
): ParentSessionTipState | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(PARENT_SESSION_TIP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ParentSessionTipState;
    if (!parsed || parsed.date !== today) return null;
    if (
      parsed.choice !== 10 &&
      parsed.choice !== 20 &&
      parsed.choice !== 30 &&
      parsed.choice !== "skip"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeParentSessionTip(
  choice: ParentSessionTipChoice,
  storage: Pick<Storage, "setItem"> | null = typeof window !== "undefined"
    ? window.localStorage
    : null,
  today: string = getTodayDateString(),
): ParentSessionTipState | null {
  if (!storage) return null;
  const next: ParentSessionTipState = { date: today, choice };
  try {
    storage.setItem(PARENT_SESSION_TIP_KEY, JSON.stringify(next));
    return next;
  } catch {
    return null;
  }
}

export function clearParentSessionTip(
  storage: Pick<Storage, "removeItem"> | null = typeof window !== "undefined"
    ? window.localStorage
    : null,
): void {
  if (!storage) return;
  try {
    storage.removeItem(PARENT_SESSION_TIP_KEY);
  } catch {
    // ignore quota / private mode
  }
}

export function parentSessionTipLabel(choice: ParentSessionTipChoice): string {
  if (choice === "skip") return "今晚先不定时长";
  return `今晚大约玩 ${choice} 分钟`;
}
