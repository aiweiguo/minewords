import { baseDecorations, isDecorationUnlocked } from "@/data/baseDecorations";
import { exploreZones, ExploreZone } from "@/data/exploreZones";
import { getVocabularyById, vocabulary } from "@/data/vocabulary";
import { isExploreZoneUnlocked } from "@/lib/exploreZones";
import {
  getHomeFillProgress,
  getWeaponGoalSnapshot,
} from "@/lib/weaponGoal";
import { MONSTER_WRONG_THRESHOLD } from "@/lib/wrongWord";
import {
  DailyStats,
  ResourceType,
  RoomBlocks,
} from "@/types";

export type TonightThingKind =
  | "craft"
  | "trade"
  | "review"
  | "fight"
  | "speak"
  | "home"
  | "daily";

export type TonightThing = {
  id: string;
  /** Short actionable line for the companion list. */
  labelCn: string;
  /** One-line why this helps tonight. */
  detailCn: string;
  href: string;
  kind: TonightThingKind;
};

export type TonightProgressInput = {
  unlockedIds: string[];
  resources: Record<ResourceType, number>;
  roomBlocks: RoomBlocks;
  wrongWordCounts: Record<string, number>;
  defeatedMonsterIds: string[];
  learnedWordIds: string[];
  masteredWordIds: string[];
  dailyStats: DailyStats;
};

const KIND_ORDER: TonightThingKind[] = [
  "craft",
  "trade",
  "review",
  "fight",
  "speak",
  "home",
  "daily",
];

function bestOpenZone(unlockedIds: string[]): ExploreZone {
  const open = [...exploreZones]
    .reverse()
    .find((zone) => isExploreZoneUnlocked(zone, unlockedIds));
  return open ?? exploreZones[0];
}

function zoneForGoal(
  unlockedIds: string[],
  focusResource: ResourceType | null,
): ExploreZone {
  if (focusResource) {
    const match = exploreZones.find(
      (zone) =>
        zone.focusResource === focusResource &&
        isExploreZoneUnlocked(zone, unlockedIds),
    );
    if (match) return match;
  }
  return bestOpenZone(unlockedIds);
}

function firstReviewWordId(
  wrongWordCounts: Record<string, number>,
  defeatedMonsterIds: string[],
): string | null {
  const hit = Object.entries(wrongWordCounts)
    .filter(
      ([wordId, count]) =>
        count >= MONSTER_WRONG_THRESHOLD &&
        !defeatedMonsterIds.includes(wordId),
    )
    .sort((a, b) => b[1] - a[1])[0];
  return hit?.[0] ?? null;
}

function followWordId(input: TonightProgressInput): string | null {
  const goal = getWeaponGoalSnapshot(
    input.unlockedIds,
    input.resources,
    input.roomBlocks,
  );

  if (goal.status === "ready" && goal.goal) {
    const speechWord = goal.goal.speechKeywords.find((id) =>
      Boolean(getVocabularyById(id)),
    );
    if (speechWord) return speechWord;
  }

  if (goal.primaryMissing) {
    const resourceWord = getVocabularyById(goal.primaryMissing.resource);
    if (resourceWord) return resourceWord.id;
  }

  if (goal.goal?.id === "diamond-sword") {
    const diamond = getVocabularyById("diamond");
    if (diamond) return diamond.id;
  }

  const reviewId = firstReviewWordId(
    input.wrongWordCounts,
    input.defeatedMonsterIds,
  );
  if (reviewId && getVocabularyById(reviewId)) return reviewId;

  const learnedNotMastered = vocabulary.find(
    (w) =>
      input.learnedWordIds.includes(w.id) &&
      !input.masteredWordIds.includes(w.id),
  );
  if (learnedNotMastered) return learnedNotMastered.id;

  const nextDecoWord = nextDecorationWord(input);
  if (nextDecoWord) return nextDecoWord;

  return getVocabularyById("diamond")?.id ?? vocabulary[0]?.id ?? null;
}

function nextDecorationWord(input: TonightProgressInput): string | null {
  for (const deco of baseDecorations) {
    if (
      isDecorationUnlocked(
        deco,
        input.learnedWordIds,
        input.masteredWordIds,
      )
    ) {
      continue;
    }
    const known = new Set([
      ...input.learnedWordIds,
      ...input.masteredWordIds,
    ]);
    const missing = deco.requiredWordIds.find((id) => !known.has(id));
    if (missing && getVocabularyById(missing)) return missing;
  }
  return null;
}

function canPlaceHomeBlock(input: TonightProgressInput): boolean {
  const home = getHomeFillProgress(input.roomBlocks);
  if (home.empty <= 0) return false;
  return (input.resources.wood ?? 0) >= 1 || (input.resources.stone ?? 0) >= 1;
}

function buildCandidates(input: TonightProgressInput): TonightThing[] {
  const goal = getWeaponGoalSnapshot(
    input.unlockedIds,
    input.resources,
    input.roomBlocks,
  );
  const home = getHomeFillProgress(input.roomBlocks);
  const candidates: TonightThing[] = [];

  if (goal.status === "ready" && goal.goal) {
    candidates.push({
      id: `craft-${goal.goal.id}`,
      labelCn: `开口合成${goal.goal.goalLabelCn}`,
      detailCn: "材料已够，今晚说完就能挂上武器架。",
      href: `/crafting/${goal.goal.id}`,
      kind: "craft",
    });
  }

  if (goal.canTrade) {
    candidates.push({
      id: "trade-once",
      labelCn: "跟村民交易一次",
      detailCn: "开口说交易句，用绿宝石换钻石。",
      href: "/trade",
      kind: "trade",
    });
  }

  const reviewId = firstReviewWordId(
    input.wrongWordCounts,
    input.defeatedMonsterIds,
  );
  const reviewWord = reviewId ? getVocabularyById(reviewId) : null;
  if (reviewWord) {
    candidates.push({
      id: `review-${reviewWord.id}`,
      labelCn: `打掉错词怪 ${reviewWord.english}`,
      detailCn: "开口复习常错词，清掉一只错词怪。",
      href: "/fight",
      kind: "review",
    });
  }

  const focus =
    goal.status === "gather" && goal.primaryMissing
      ? goal.primaryMissing.resource
      : goal.goal?.costs[0]?.resource ?? null;
  const zone = zoneForGoal(input.unlockedIds, focus);
  const crystalOpen = isExploreZoneUnlocked(
    exploreZones.find((z) => z.id === "crystal")!,
    input.unlockedIds,
  );
  const wantsCrystal =
    crystalOpen &&
    (focus === "diamond" ||
      goal.goal?.id === "diamond-sword" ||
      goal.status === "line-complete");

  if (wantsCrystal) {
    candidates.push({
      id: "fight-crystal-once",
      labelCn: "Crystal 打 1 次",
      detailCn:
        focus === "diamond" || goal.goal?.id === "diamond-sword"
          ? "钻石矿脉开口打怪，攒钻石推进钻石剑。"
          : "钻后继续在矿脉开口探险。",
      href: "/explore",
      kind: "fight",
    });
  } else {
    candidates.push({
      id: `fight-${zone.id}-once`,
      labelCn: `${zone.nameCn}打 1 次`,
      detailCn: `开口打怪攒 ${zone.focusLabelCn}，推进当前目标。`,
      href: "/explore",
      kind: "fight",
    });
  }

  const wordId = followWordId(input);
  const followWord = wordId ? getVocabularyById(wordId) : null;
  if (followWord) {
    candidates.push({
      id: `follow-${followWord.id}`,
      labelCn: `跟读 ${followWord.english}`,
      detailCn: "先听再跟读一遍；无麦也能走跟读模式。",
      href: `/dictionary/${followWord.id}`,
      kind: "speak",
    });
  }

  if (canPlaceHomeBlock(input)) {
    candidates.push({
      id: "place-home-block",
      labelCn: "铺一块家",
      detailCn: `基地还差 ${home.empty} 格，今晚铺一格就有成就感。`,
      href: "/#decorate",
      kind: "home",
    });
  } else if (home.empty > 0) {
    candidates.push({
      id: "gather-then-home",
      labelCn: "攒料后铺一块家",
      detailCn: `家还空 ${home.empty} 格；先打怪拿木头/石头再回家铺。`,
      href: "/explore",
      kind: "home",
    });
  }

  const todayActive = input.dailyStats.date.length > 0;
  if (todayActive && !input.dailyStats.dailyAdventureCompleted) {
    candidates.push({
      id: "daily-adventure",
      labelCn: "完成今日一委托",
      detailCn: "短局收尾：做完今日冒险再睡觉。",
      href: "/quests",
      kind: "daily",
    });
  }

  return candidates;
}

/**
 * Pick exactly three companion actions from current progress.
 * Prefers distinct kinds so the list is fight · speak · home shaped, not a dashboard.
 */
export function getTonightThreeThings(
  input: TonightProgressInput,
): TonightThing[] {
  const candidates = buildCandidates(input);
  const picked: TonightThing[] = [];
  const usedKinds = new Set<TonightThingKind>();

  for (const kind of KIND_ORDER) {
    if (picked.length >= 3) break;
    const next = candidates.find(
      (item) => item.kind === kind && !usedKinds.has(item.kind),
    );
    if (next) {
      picked.push(next);
      usedKinds.add(next.kind);
    }
  }

  for (const item of candidates) {
    if (picked.length >= 3) break;
    if (picked.some((p) => p.id === item.id)) continue;
    picked.push(item);
  }

  while (picked.length < 3) {
    const fallbackId = `fallback-${picked.length}`;
    picked.push({
      id: fallbackId,
      labelCn: picked.length === 0 ? "开口打怪一次" : "回基地看看进度",
      detailCn: "陪孩子走一圈主环：探索 → 打怪 → 回家。",
      href: picked.length === 0 ? "/explore" : "/",
      kind: "fight",
    });
  }

  return picked.slice(0, 3);
}
