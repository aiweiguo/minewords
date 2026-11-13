import {
  getHomeFillProgress,
  getWeaponGoalSnapshot,
  WeaponGoalExtras,
} from "@/lib/weaponGoal";
import { ResourceType, RoomBlocks } from "@/types";

/** Once-per-milestone hub celebrations (MW-60 / P2-2). */
export type MilestoneCelebrationKind = "diamondLine" | "homeFull";

export type MilestoneCelebrationsSeen = {
  diamondLine?: boolean;
  homeFull?: boolean;
};

export type MilestoneCelebrationCopy = {
  kind: MilestoneCelebrationKind;
  titleCn: string;
  titleEn: string;
  leadCn: string;
  leadEn: string;
  ctaLabelCn: string;
  ctaLabelEn: string;
  ctaHref: string;
};

/**
 * Pending celebration after hydration. Natural order: hang diamond sword first,
 * then home-full (which unlocks the weekly challenge path from MW-55).
 */
export function getPendingMilestoneCelebration(
  unlockedIds: string[],
  roomBlocks: RoomBlocks,
  seen: MilestoneCelebrationsSeen,
): MilestoneCelebrationKind | null {
  const hasDiamond = unlockedIds.includes("diamond-sword");
  if (!hasDiamond) {
    return null;
  }

  if (!seen.diamondLine) {
    return "diamondLine";
  }

  const home = getHomeFillProgress(roomBlocks);
  if (home.empty === 0 && !seen.homeFull) {
    return "homeFull";
  }

  return null;
}

export function getMilestoneCelebrationCopy(
  kind: MilestoneCelebrationKind,
  unlockedIds: string[],
  resources: Record<ResourceType, number>,
  roomBlocks: RoomBlocks,
  extras: WeaponGoalExtras = {},
): MilestoneCelebrationCopy {
  const snapshot = getWeaponGoalSnapshot(
    unlockedIds,
    resources,
    roomBlocks,
    {
      ...extras,
      unlockedIds: extras.unlockedIds ?? unlockedIds,
    },
  );

  if (kind === "diamondLine") {
    const homeEmpty = snapshot.homeFill?.empty ?? 0;
    const handoffWeekly =
      homeEmpty === 0 && snapshot.weekly && !snapshot.weekly.done;
    return {
      kind,
      titleCn: "钻石剑挂上了！",
      titleEn: "Diamond sword on the rack!",
      leadCn: handoffWeekly
        ? "武装线打通了。接着是本周挑战！"
        : "武装线打通了。下一步：用木板/圆石/玻璃/羊毛填满我家。",
      leadEn: handoffWeekly
        ? "Weapon line complete. Next up: this week's challenge!"
        : "Weapon line complete. Next: fill home with plank/cobble/glass/wool.",
      ctaLabelCn: snapshot.primaryCta.labelCn,
      ctaLabelEn: snapshot.primaryCta.labelEn,
      ctaHref: snapshot.primaryCta.href,
    };
  }

  return {
    kind,
    titleCn: "我家铺满了！",
    titleEn: "Home is full!",
    leadCn: snapshot.weekly
      ? snapshot.weekly.done
        ? "家装满了。本周挑战已完成 — 想探险就出门！"
        : `家装满了。本周挑战：${snapshot.weekly.challenge.stripCn}`
      : "家装满了。回基地看看下一目标。",
    leadEn: snapshot.weekly
      ? snapshot.weekly.done
        ? "Home filled. Weekly done — explore when you want!"
        : `Home filled. Weekly: ${snapshot.weekly.challenge.stripEn}`
      : "Home filled. Check the next goal on the hub.",
    ctaLabelCn: snapshot.primaryCta.labelCn,
    ctaLabelEn: snapshot.primaryCta.labelEn,
    ctaHref: snapshot.primaryCta.href,
  };
}
