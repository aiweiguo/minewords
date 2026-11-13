import { ExploreZoneId, getExploreZoneById } from "@/data/exploreZones";
import { guides } from "@/data/guides";
import { quests } from "@/data/quests";
import { vocabulary } from "@/data/vocabulary";
import { WeaponTierId, weaponTiers } from "@/data/weapons";
import { getTodayDateString } from "@/lib/date";
import { isExploreZoneUnlocked } from "@/lib/exploreZones";
import { getCurrentWeaponGoal } from "@/lib/weaponGoal";
import { DailyAdventurePlan, Reward } from "@/types";

type AdventureTemplate = Omit<DailyAdventurePlan, "id"> & {
  /** Stable slug for id + hash (survives pool filtering). */
  slug: string;
};

/**
 * Progress-aware daily templates (MW-54 / Ship A).
 * Every row is fight · craft · trade · home — no guide-quiz-only days.
 */
const adventureTemplates: AdventureTemplate[] = [
  {
    slug: "forest-wood",
    title: "Forest Wood Run",
    titleCn: "森林攒木",
    descriptionCn: "开口打怪攒木头，推进木剑。",
    wordIds: ["wood", "tree", "plank", "stick", "craft"],
    actionKind: "fight",
    actionCount: 2,
    exploreZoneId: "forest",
    questId: "wood-fights-for-sword",
    guideId: "survive-first-night",
    rewards: [
      { type: "resource", resource: "wood", amount: 3 },
      { type: "xp", xp: 10 },
    ],
  },
  {
    slug: "craft-wood-sword",
    title: "Craft the Wooden Sword",
    titleCn: "合成木剑日",
    descriptionCn: "材料够了就去工作台开口合成木剑。",
    wordIds: ["sword", "wood", "stick", "craft", "attack"],
    actionKind: "craft",
    actionCount: 1,
    questId: "craft-wooden-sword-errand",
    rewards: [
      { type: "resource", resource: "wood", amount: 2 },
      { type: "xp", xp: 12 },
    ],
  },
  {
    slug: "place-home",
    title: "Place a Home Block",
    titleCn: "回家铺一块",
    descriptionCn: "回基地铺一块 plank / cobble / glass / wool。",
    wordIds: ["plank", "wood", "home", "build", "craft"],
    actionKind: "home",
    actionCount: 1,
    rewards: [
      { type: "resource", resource: "wood", amount: 2 },
      { type: "xp", xp: 8 },
    ],
  },
  {
    slug: "cave-stone",
    title: "Cave Stone Run",
    titleCn: "洞穴攒石",
    descriptionCn: "进洞穴开口打怪，为石剑凑石头。",
    wordIds: ["stone", "cave", "mine", "pickaxe", "skeleton"],
    actionKind: "fight",
    actionCount: 2,
    exploreZoneId: "cave",
    requiredUnlockedWeaponId: "wooden-sword",
    questId: "stone-fights-for-sword",
    guideId: "mining-basics",
    rewards: [
      { type: "resource", resource: "stone", amount: 3 },
      { type: "xp", xp: 12 },
    ],
  },
  {
    slug: "fight-night",
    title: "Fight at Night",
    titleCn: "夜晚战斗",
    descriptionCn: "多开口打怪，喂当前武器目标。",
    wordIds: ["zombie", "sword", "fight", "night", "monster"],
    actionKind: "fight",
    actionCount: 2,
    exploreZoneId: "forest",
    questId: "wood-fights-for-sword",
    guideId: "fight-zombie",
    rewards: [
      { type: "resource", resource: "wood", amount: 2 },
      { type: "xp", xp: 10 },
    ],
  },
  {
    slug: "speak-craft",
    title: "Speak to Craft",
    titleCn: "开口合成",
    descriptionCn: "回到工作台，用语音合成当前武器。",
    wordIds: ["craft", "sword", "wood", "stone", "stick"],
    actionKind: "craft",
    actionCount: 1,
    questId: "gather-wood-for-sword",
    rewards: [
      { type: "resource", resource: "wood", amount: 2 },
      { type: "xp", xp: 10 },
    ],
  },
  {
    slug: "craft-stone-sword",
    title: "Stone Sword Day",
    titleCn: "石剑日",
    descriptionCn: "推进石剑：开口合成石剑挂上武器架。",
    wordIds: ["stone", "sword", "craft", "cave", "skeleton"],
    actionKind: "craft",
    actionCount: 1,
    requiredUnlockedWeaponId: "wooden-sword",
    questId: "craft-stone-sword-errand",
    rewards: [
      { type: "resource", resource: "stone", amount: 2 },
      { type: "xp", xp: 15 },
    ],
  },
  {
    slug: "mines-iron",
    title: "Deep Mines Iron Run",
    titleCn: "矿洞攒铁",
    descriptionCn: "进深层矿洞开口打怪，为铁剑凑铁。",
    wordIds: ["iron", "mine", "craft", "sword", "blaze"],
    actionKind: "fight",
    actionCount: 2,
    exploreZoneId: "mines",
    requiredUnlockedWeaponId: "stone-sword",
    questId: "iron-fights-for-sword",
    guideId: "mining-basics",
    rewards: [
      { type: "resource", resource: "iron", amount: 3 },
      { type: "xp", xp: 14 },
    ],
  },
  {
    slug: "craft-iron-sword",
    title: "Iron Sword Day",
    titleCn: "铁剑日",
    descriptionCn: "推进铁剑：开口合成铁剑挂上武器架。",
    wordIds: ["iron", "sword", "craft", "mine", "stick"],
    actionKind: "craft",
    actionCount: 1,
    requiredUnlockedWeaponId: "stone-sword",
    questId: "craft-iron-sword-errand",
    rewards: [
      { type: "resource", resource: "iron", amount: 2 },
      { type: "xp", xp: 16 },
    ],
  },
  {
    slug: "crystal-diamond",
    title: "Crystal Diamond Run",
    titleCn: "矿脉攒钻",
    descriptionCn: "进钻石矿脉开口打怪，为钻石剑凑钻。",
    wordIds: ["diamond", "sword", "craft", "mine", "crystal"],
    actionKind: "fight",
    actionCount: 2,
    exploreZoneId: "crystal",
    requiredUnlockedWeaponId: "iron-sword",
    questId: "crystal-fights-for-sword",
    guideId: "diamond-sword-guide",
    rewards: [
      { type: "resource", resource: "diamond", amount: 1 },
      { type: "xp", xp: 16 },
    ],
  },
  {
    slug: "craft-diamond-sword",
    title: "Diamond Sword Day",
    titleCn: "钻石剑日",
    descriptionCn: "推进钻石剑：开口合成钻石剑挂上武器架。",
    wordIds: ["diamond", "sword", "craft", "stick", "trade"],
    actionKind: "craft",
    actionCount: 1,
    requiredUnlockedWeaponId: "iron-sword",
    questId: "craft-diamond-sword-errand",
    rewards: [
      { type: "resource", resource: "diamond", amount: 1 },
      { type: "xp", xp: 18 },
    ],
  },
  {
    slug: "emerald-trade",
    title: "Emerald Trade Day",
    titleCn: "绿宝石买钻日",
    descriptionCn: "攒绿宝石，开口去交易买钻石做剑。",
    wordIds: ["emerald", "diamond", "trade", "buy", "sword"],
    actionKind: "trade",
    actionCount: 1,
    requiredUnlockedWeaponId: "iron-sword",
    questId: "trade-emerald-buy-diamond",
    rewards: [
      { type: "resource", resource: "emerald", amount: 2 },
      { type: "xp", xp: 14 },
    ],
  },
];

const GOAL_ZONE: Record<WeaponTierId, ExploreZoneId> = {
  "wooden-sword": "forest",
  "stone-sword": "cave",
  "iron-sword": "mines",
  "diamond-sword": "crystal",
};

function hashDate(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i += 1) {
    hash = (hash * 31 + date.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Hard gate: no early-game diamond / locked-zone days. */
export function isDailyAdventureTemplateEligible(
  template: Pick<
    AdventureTemplate,
    "exploreZoneId" | "requiredUnlockedWeaponId" | "actionKind"
  >,
  unlockedIds: string[],
): boolean {
  if (template.requiredUnlockedWeaponId) {
    if (!unlockedIds.includes(template.requiredUnlockedWeaponId)) {
      return false;
    }
  }
  if (template.exploreZoneId) {
    const zone = getExploreZoneById(template.exploreZoneId);
    if (!zone || !isExploreZoneUnlocked(zone, unlockedIds)) {
      return false;
    }
  }
  return true;
}

/**
 * Prefer templates that feed the current weapon goal (or home/trade after iron).
 * Falls back to the full eligible pool when none match.
 */
export function preferDailyAdventuresForProgress(
  templates: AdventureTemplate[],
  unlockedIds: string[],
): AdventureTemplate[] {
  const goal = getCurrentWeaponGoal(unlockedIds);
  const goalZone = goal ? GOAL_ZONE[goal.id] : null;
  const lineComplete = !goal;

  const preferred = templates.filter((template) => {
    if (template.actionKind === "home") return true;
    if (lineComplete) {
      // Post-diamond: keep fight + trade soft loops (home already included).
      return template.actionKind === "fight" || template.actionKind === "trade";
    }
    if (template.actionKind === "fight") {
      return template.exploreZoneId === goalZone;
    }
    if (template.actionKind === "craft") {
      // Wooden craft days have no required weapon; match when wood is the goal.
      if (!template.requiredUnlockedWeaponId) {
        return goal.id === "wooden-sword";
      }
      // Craft stone requires wooden unlocked → stone is the goal, etc.
      const reqIndex = weaponTiers.findIndex(
        (t) => t.id === template.requiredUnlockedWeaponId,
      );
      const next = weaponTiers[reqIndex + 1];
      return next?.id === goal.id;
    }
    if (template.actionKind === "trade") {
      return goal.id === "diamond-sword";
    }
    return false;
  });

  return preferred.length > 0 ? preferred : templates;
}

export function listEligibleDailyAdventureTemplates(
  unlockedIds: string[] = [],
): AdventureTemplate[] {
  return adventureTemplates.filter((template) =>
    isDailyAdventureTemplateEligible(template, unlockedIds),
  );
}

function materializePlan(
  date: string,
  template: AdventureTemplate,
): DailyAdventurePlan {
  const { slug, ...rest } = template;
  return {
    id: `daily-${date}-${slug}`,
    ...rest,
    wordIds: template.wordIds.filter((id) =>
      vocabulary.some((word) => word.id === id),
    ),
    questId:
      template.questId && quests.some((q) => q.id === template.questId)
        ? template.questId
        : undefined,
    guideId:
      template.guideId && guides.some((g) => g.id === template.guideId)
        ? template.guideId
        : undefined,
  };
}

/**
 * Pick today's adventure from progress-filtered templates.
 * Pass unlockedIds so early saves never see emerald/diamond days.
 */
export function getDailyAdventure(
  date: string,
  unlockedIds: string[] = [],
): DailyAdventurePlan {
  const eligible = listEligibleDailyAdventureTemplates(unlockedIds);
  const pool =
    eligible.length > 0
      ? preferDailyAdventuresForProgress(eligible, unlockedIds)
      : adventureTemplates.filter((t) => t.actionKind === "fight" || t.actionKind === "home");
  const index = hashDate(date) % pool.length;
  return materializePlan(date, pool[index]);
}

export function getDailyAdventurePlayHref(plan: DailyAdventurePlan): string {
  switch (plan.actionKind) {
    case "fight":
      return "/explore";
    case "craft":
      return "/crafting";
    case "trade":
      return "/trade";
    case "home":
      return "/";
    default:
      return "/explore";
  }
}

export function getDailyAdventurePlayLabel(plan: DailyAdventurePlan): string {
  switch (plan.actionKind) {
    case "fight":
      return "出门打怪";
    case "craft":
      return "去开口合成";
    case "trade":
      return "去开口交易";
    case "home":
      return "回家铺一块";
    default:
      return "去做今日冒险";
  }
}

/** Exported for smoke / audits — template catalog size after Ship A. */
export function listAllDailyAdventureTemplates(): AdventureTemplate[] {
  return adventureTemplates.slice();
}

export { getTodayDateString };

export function formatDailyRewards(rewards: Reward[]): string {
  return rewards
    .map((r) => {
      if (r.type === "resource" && r.resource) {
        return `${r.resource} x${r.amount}`;
      }
      if (r.type === "xp") return `XP +${r.xp}`;
      return "";
    })
    .filter(Boolean)
    .join(", ");
}
