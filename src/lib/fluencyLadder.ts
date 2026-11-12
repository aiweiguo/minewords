import { ExploreZoneId, getExploreZoneById } from "@/data/exploreZones";
import {
  AttackSpeechPrompt,
  FluencyRung,
  FLUENCY_RUNG_ORDER,
  getAttackSpeechLadder,
  nextFluencyRung,
  prevFluencyRung,
} from "@/lib/attackSpeech";
import { scoreSpeechAttempt } from "@/lib/speechRecognition";

/** Hearts on every speak-attack encounter (MW-19). */
export const MONSTER_MAX_HP = 3;

export const FLUENCY_DAMAGE: Record<FluencyRung, number> = {
  word: 1,
  phrase: 2,
  sentence: 3,
};

/**
 * Consecutive scored misses before the suggested prompt steps down one rung (MW-35).
 * Mic failures do not count — only fluency score misses.
 */
export const MISS_STREAK_TO_STEP_DOWN = 2;

export type FluencyScoreResult = {
  /** Highest rung that matched; null = miss. */
  rung: FluencyRung | null;
  damage: number;
  matchedKeywords: string[];
  /** True when damage is below a full-HP wipe (partial fluency). */
  isPartial: boolean;
  feedbackCn: string;
  feedbackEn: string;
};

/**
 * Score a transcript against the full word → phrase → sentence ladder.
 * Lenient keyword matching (same as scoreSpeechAttempt); highest rung wins.
 */
export function scoreFluencyAttempt(
  transcript: string,
  wordId: string,
  zoneId?: ExploreZoneId | null,
): FluencyScoreResult {
  const ladder = getAttackSpeechLadder(wordId, zoneId);
  let best: FluencyRung | null = null;
  let matchedKeywords: string[] = [];

  for (const rung of FLUENCY_RUNG_ORDER) {
    const prompt = ladder[rung];
    const score = scoreSpeechAttempt(
      transcript,
      prompt.expectedText,
      prompt.keywords,
    );
    if (score.passed) {
      best = rung;
      matchedKeywords = score.matchedKeywords;
    }
  }

  if (!best) {
    return {
      rung: null,
      damage: 0,
      matchedKeywords: [],
      isPartial: false,
      feedbackCn: "没打中，再试一次！",
      feedbackEn: "Miss — try again!",
    };
  }

  const damage = FLUENCY_DAMAGE[best];
  const isPartial = damage < MONSTER_MAX_HP;
  const feedback = buildHitFeedback(best, isPartial);

  return {
    rung: best,
    damage,
    matchedKeywords,
    isPartial,
    feedbackCn: feedback.cn,
    feedbackEn: feedback.en,
  };
}

function buildHitFeedback(
  rung: FluencyRung,
  isPartial: boolean,
): { cn: string; en: string } {
  if (rung === "word") {
    return {
      cn: isPartial
        ? "只说了单词，伤害变小！再说短句伤害更大"
        : "单词打中了！",
      en: isPartial
        ? "Word only — smaller damage! Try a short phrase for more."
        : "Word hit!",
    };
  }
  if (rung === "phrase") {
    return {
      cn: isPartial
        ? "短句打中了！再说整句伤害打满"
        : "短句打中了！",
      en: isPartial
        ? "Phrase hit! Full sentence does max damage."
        : "Phrase hit!",
    };
  }
  return {
    cn: "整句打满伤害！",
    en: "Full sentence — max damage!",
  };
}

export function applyDamage(hp: number, damage: number): number {
  return Math.max(0, hp - damage);
}

export function raiseSuggestedRung(
  current: FluencyRung,
  matched: FluencyRung | null,
): FluencyRung {
  if (!matched) return current;
  // After any hit, nudge the kid toward the next harder prompt.
  const raisedFromMatch = nextFluencyRung(matched) ?? matched;
  const raisedFromCurrent = nextFluencyRung(current) ?? current;
  const matchIndex = FLUENCY_RUNG_ORDER.indexOf(raisedFromMatch);
  const currentIndex = FLUENCY_RUNG_ORDER.indexOf(raisedFromCurrent);
  return FLUENCY_RUNG_ORDER[Math.max(matchIndex, currentIndex)] ?? current;
}

export function lowerSuggestedRung(current: FluencyRung): FluencyRung {
  return prevFluencyRung(current) ?? current;
}

export type MissStepDownResult = {
  nextRung: FluencyRung;
  nextMissStreak: number;
  didStepDown: boolean;
};

/**
 * Count a fluency miss; after MISS_STREAK_TO_STEP_DOWN consecutive misses,
 * drop one rung (may go below the zone start — mines/crystal can reach word).
 */
export function applyMissStepDown(
  current: FluencyRung,
  missStreak: number,
): MissStepDownResult {
  const streak = missStreak + 1;
  if (streak < MISS_STREAK_TO_STEP_DOWN) {
    return {
      nextRung: current,
      nextMissStreak: streak,
      didStepDown: false,
    };
  }
  const lowered = lowerSuggestedRung(current);
  return {
    nextRung: lowered,
    nextMissStreak: 0,
    didStepDown: lowered !== current,
  };
}

export function missStepDownFeedback(rung: FluencyRung): {
  cn: string;
  en: string;
} {
  return {
    cn: `连续没打中，降到「${rungLabelCn(rung)}」再试！`,
    en: `Missed twice — stepping down to ${rungLabelEn(rung)}.`,
  };
}

export function getPromptForRung(
  wordId: string,
  rung: FluencyRung,
  zoneId?: ExploreZoneId | null,
): AttackSpeechPrompt {
  return getAttackSpeechLadder(wordId, zoneId)[rung];
}

/**
 * Zone attackSpeech is the *starting* suggested rung (forest word · cave phrase · mines/crystal sentence).
 * MW-35: misses can step below that start down to word; hits still raise.
 */
export function getStartingSuggestedRung(
  zoneId?: ExploreZoneId | null,
): FluencyRung {
  return getExploreZoneById(zoneId)?.attackSpeech ?? "word";
}

export function rungLabelCn(rung: FluencyRung): string {
  if (rung === "word") return "单词";
  if (rung === "phrase") return "短句";
  return "整句";
}

export function rungLabelEn(rung: FluencyRung): string {
  if (rung === "word") return "Word";
  if (rung === "phrase") return "Phrase";
  return "Sentence";
}
