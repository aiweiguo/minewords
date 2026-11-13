import {
  baseDecorations,
  isDecorationUnlocked,
} from "@/data/baseDecorations";
import { ExploreZoneId } from "@/data/exploreZones";
import { getWeekStartDateString } from "@/lib/date";

export type WeeklyChallengeKind =
  | "zone-monster"
  | "villager-chat"
  | "light-decor";

export type WeeklyChallengeDef = {
  id: string;
  kind: WeeklyChallengeKind;
  /** Progress target (defeats / turns / lit decorations). */
  target: number;
  monsterId?: string;
  exploreZoneId?: ExploreZoneId;
  stripCn: string;
  stripEn: string;
  doneStripCn: string;
  doneStripEn: string;
  nextPreviewCn: string;
  nextPreviewEn: string;
  primaryCta: {
    href: string;
    labelCn: string;
    labelEn: string;
    kind: "fight" | "trade" | "home";
  };
};

/**
 * Monday-bucket rotating challenges for post-diamond + home-full (MW-55 / Ship B).
 * Keeps kids from landing on limp「回我家看看」after clearing the weapon + place lines.
 */
export const WEEKLY_CHALLENGE_ROTATION: WeeklyChallengeDef[] = [
  {
    id: "sheep-wool",
    kind: "zone-monster",
    target: 1,
    monsterId: "sheep",
    exploreZoneId: "forest",
    stripCn: "本周挑战 · 森林开口打羊（学 wool）",
    stripEn: "Weekly · defeat a sheep in the forest",
    doneStripCn: "本周挑战完成 · 打过羊了",
    doneStripEn: "Weekly done · sheep defeated",
    nextPreviewCn: "下周换挑战 · 打羊掉羊毛可铺家",
    nextPreviewEn: "Next week rotates · sheep drop wool to place",
    primaryCta: {
      href: "/explore",
      labelCn: "去打羊",
      labelEn: "Fight sheep",
      kind: "fight",
    },
  },
  // MW-58: forest pig feeds crafting-corner decor words.
  {
    id: "pig-craft",
    kind: "zone-monster",
    target: 1,
    monsterId: "pig",
    exploreZoneId: "forest",
    stripCn: "本周挑战 · 森林开口打猪（学 craft/plank）",
    stripEn: "Weekly · defeat a pig in the forest",
    doneStripCn: "本周挑战完成 · 打过猪了",
    doneStripEn: "Weekly done · pig defeated",
    nextPreviewCn: "下周换挑战 · 打猪学合成角词语",
    nextPreviewEn: "Next week rotates · pig teaches craft words",
    primaryCta: {
      href: "/explore",
      labelCn: "去打猪",
      labelEn: "Fight pig",
      kind: "fight",
    },
  },
  {
    id: "villager-3",
    kind: "villager-chat",
    target: 3,
    stripCn: "本周挑战 · 村民深聊 3 轮",
    stripEn: "Weekly · finish 3 villager chat turns",
    doneStripCn: "本周挑战完成 · 村民聊满 3 轮",
    doneStripEn: "Weekly done · villager chat complete",
    nextPreviewCn: "下周换挑战 · 开口跟村民把话说完",
    nextPreviewEn: "Next week rotates · speak through villager turns",
    primaryCta: {
      href: "/trade",
      labelCn: "找村民",
      labelEn: "Find villager",
      kind: "trade",
    },
  },
  {
    id: "light-3-decor",
    kind: "light-decor",
    target: 3,
    stripCn: "本周挑战 · 点亮 3 个学词装饰",
    stripEn: "Weekly · light 3 word decorations",
    doneStripCn: "本周挑战完成 · 已点亮 3 个装饰",
    doneStripEn: "Weekly done · 3 decorations lit",
    nextPreviewCn: "下周换挑战 · 学词点亮墙上装饰",
    nextPreviewEn: "Next week rotates · learn words to light decor",
    primaryCta: {
      href: "/#decorate",
      labelCn: "去点亮",
      labelEn: "Light decor",
      kind: "home",
    },
  },
  {
    id: "witch-cave",
    kind: "zone-monster",
    target: 1,
    monsterId: "witch",
    exploreZoneId: "cave",
    stripCn: "本周挑战 · 洞穴开口打女巫",
    stripEn: "Weekly · defeat a witch in the cave",
    doneStripCn: "本周挑战完成 · 打过女巫了",
    doneStripEn: "Weekly done · witch defeated",
    nextPreviewCn: "下周换挑战 · 洞穴专属怪词",
    nextPreviewEn: "Next week rotates · cave exclusive word",
    primaryCta: {
      href: "/explore",
      labelCn: "去洞穴",
      labelEn: "Go cave",
      kind: "fight",
    },
  },
  {
    id: "light-5-decor",
    kind: "light-decor",
    target: 5,
    stripCn: "本周挑战 · 点亮 5 个学词装饰",
    stripEn: "Weekly · light 5 word decorations",
    doneStripCn: "本周挑战完成 · 已点亮 5 个装饰",
    doneStripEn: "Weekly done · 5 decorations lit",
    nextPreviewCn: "下周换挑战 · 继续学词装扮基地",
    nextPreviewEn: "Next week rotates · keep lighting the base",
    primaryCta: {
      href: "/#decorate",
      labelCn: "去点亮",
      labelEn: "Light decor",
      kind: "home",
    },
  },
  {
    id: "enderman-mines",
    kind: "zone-monster",
    target: 1,
    monsterId: "enderman",
    exploreZoneId: "mines",
    stripCn: "本周挑战 · 矿洞开口打末影人",
    stripEn: "Weekly · defeat an enderman in the mines",
    doneStripCn: "本周挑战完成 · 打过末影人了",
    doneStripEn: "Weekly done · enderman defeated",
    nextPreviewCn: "下周换挑战 · 矿洞专属怪词",
    nextPreviewEn: "Next week rotates · mines exclusive word",
    primaryCta: {
      href: "/explore",
      labelCn: "去矿洞",
      labelEn: "Go mines",
      kind: "fight",
    },
  },
  {
    id: "villager-3-again",
    kind: "villager-chat",
    target: 3,
    stripCn: "本周挑战 · 再跟村民深聊 3 轮",
    stripEn: "Weekly · villager deep chat ×3",
    doneStripCn: "本周挑战完成 · 村民深聊满了",
    doneStripEn: "Weekly done · villager chat complete",
    nextPreviewCn: "下周换挑战 · 交易前先开口聊完",
    nextPreviewEn: "Next week rotates · finish chat before trade",
    primaryCta: {
      href: "/trade",
      labelCn: "找村民",
      labelEn: "Find villager",
      kind: "trade",
    },
  },
  {
    id: "dragon-crystal",
    kind: "zone-monster",
    target: 1,
    monsterId: "dragon",
    exploreZoneId: "crystal",
    stripCn: "本周挑战 · 矿脉开口打龙",
    stripEn: "Weekly · defeat the dragon in Crystal Depths",
    doneStripCn: "本周挑战完成 · 打过龙了",
    doneStripEn: "Weekly done · dragon defeated",
    nextPreviewCn: "下周换挑战 · 钻石矿脉专属怪词",
    nextPreviewEn: "Next week rotates · crystal exclusive word",
    primaryCta: {
      href: "/explore",
      labelCn: "去矿脉",
      labelEn: "Go crystal",
      kind: "fight",
    },
  },
];

export type WeeklyChallengeContext = {
  learnedWordIds: string[];
  masteredWordIds: string[];
  unlockedIds: string[];
  defeatedMonsterIds: string[];
  /** Completed hub villager deep-chat turns (0–3). */
  villagerChatTurnsDone: number;
};

export type WeeklyChallengeProgress = {
  challenge: WeeklyChallengeDef;
  weekStart: string;
  have: number;
  need: number;
  done: boolean;
};

function hashWeekStart(weekStart: string): number {
  let hash = 0;
  for (let i = 0; i < weekStart.length; i += 1) {
    hash = (hash * 31 + weekStart.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getWeeklyChallenge(
  date: Date = new Date(),
): WeeklyChallengeDef {
  const weekStart = getWeekStartDateString(date);
  const index =
    hashWeekStart(weekStart) % WEEKLY_CHALLENGE_ROTATION.length;
  return WEEKLY_CHALLENGE_ROTATION[index]!;
}

export function countLitDecorations(
  learnedWordIds: string[],
  masteredWordIds: string[],
  unlockedIds: string[],
): number {
  return baseDecorations.filter(
    (deco) =>
      isDecorationUnlocked(deco, learnedWordIds, masteredWordIds) ||
      unlockedIds.includes(deco.id),
  ).length;
}

export function getWeeklyChallengeProgress(
  ctx: WeeklyChallengeContext,
  date: Date = new Date(),
): WeeklyChallengeProgress {
  const weekStart = getWeekStartDateString(date);
  const challenge = getWeeklyChallenge(date);
  let have = 0;

  if (challenge.kind === "zone-monster" && challenge.monsterId) {
    have = ctx.defeatedMonsterIds.includes(challenge.monsterId) ? 1 : 0;
  } else if (challenge.kind === "villager-chat") {
    have = Math.min(ctx.villagerChatTurnsDone, challenge.target);
  } else if (challenge.kind === "light-decor") {
    have = Math.min(
      countLitDecorations(
        ctx.learnedWordIds,
        ctx.masteredWordIds,
        ctx.unlockedIds,
      ),
      challenge.target,
    );
  }

  const need = challenge.target;
  return {
    challenge,
    weekStart,
    have,
    need,
    done: have >= need,
  };
}
