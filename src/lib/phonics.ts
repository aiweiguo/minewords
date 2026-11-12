import { getVocabularyById } from "@/data/vocabulary";
import { getWeaponTierById, WeaponTierId } from "@/data/weapons";
import { getTradeOfferById } from "@/data/trades";

/** Kid-facing grapheme digraphs / trigraphs for sound chunks. */
const MULTI_LETTER_CHUNKS = [
  "igh",
  "tch",
  "dge",
  "ear",
  "air",
  "ure",
  "tion",
  "ch",
  "sh",
  "th",
  "wh",
  "ph",
  "ck",
  "ng",
  "qu",
  "ee",
  "oo",
  "ea",
  "ai",
  "ay",
  "oa",
  "ow",
  "ou",
  "oi",
  "oy",
  "ar",
  "or",
  "er",
  "ir",
  "ur",
  "aw",
  "au",
  "ew",
  "ie",
  "ue",
] as const;

export type PhonicsChunk = {
  /** Letters the kid sees / taps. */
  grapheme: string;
  /** Spoken demo for this chunk (often same as grapheme). */
  say: string;
};

export type PhonicsPlan = {
  wordId: string;
  english: string;
  chinese: string;
  phonetic?: string;
  chunks: PhonicsChunk[];
  /** Full-word TTS / repeat target. */
  demoText: string;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Split one English token into kid-friendly sound chunks. */
export function chunkGraphemes(token: string): PhonicsChunk[] {
  const lower = token.toLowerCase().replace(/[^a-z']/g, "");
  if (!lower) return [];

  const chunks: PhonicsChunk[] = [];
  let i = 0;
  while (i < lower.length) {
    let matched = false;
    for (const multi of MULTI_LETTER_CHUNKS) {
      if (lower.startsWith(multi, i)) {
        chunks.push({ grapheme: multi, say: multi });
        i += multi.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const ch = lower[i]!;
      chunks.push({ grapheme: ch, say: ch });
      i += 1;
    }
  }
  return chunks;
}

/**
 * Build a short phonics plan for a vocabulary word.
 * Compound entries reuse their `words` parts when present.
 */
export function getPhonicsPlan(wordId: string): PhonicsPlan | null {
  const word = getVocabularyById(wordId);
  if (!word) return null;

  const english = word.english;
  const demoText = english;

  let chunks: PhonicsChunk[];
  if (word.words && word.words.length > 0) {
    chunks = word.words.flatMap((part, index) => {
      const partChunks = chunkGraphemes(part.word);
      if (index === 0 || partChunks.length === 0) return partChunks;
      return [{ grapheme: "·", say: "" }, ...partChunks];
    });
  } else {
    chunks = english
      .split(/\s+/)
      .flatMap((token, index) => {
        const partChunks = chunkGraphemes(token);
        if (index === 0 || partChunks.length === 0) return partChunks;
        return [{ grapheme: "·", say: "" }, ...partChunks];
      });
  }

  if (chunks.length === 0) {
    chunks = chunkGraphemes(english);
  }

  return {
    wordId: word.id,
    english,
    chinese: word.chinese,
    phonetic: word.phonetic,
    chunks,
    demoText,
  };
}

/** True when the kid has not yet learned / mastered this word. */
export function isUnknownWord(
  wordId: string,
  learnedWordIds: string[],
  masteredWordIds: string[] = [],
): boolean {
  if (!wordId) return false;
  if (masteredWordIds.includes(wordId)) return false;
  if (learnedWordIds.includes(wordId)) return false;
  return getVocabularyById(wordId) != null;
}

/** Resolve vocabulary id from a speech keyword / resource name. */
export function resolveVocabIdFromKeyword(keyword: string): string | undefined {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return undefined;
  const exact = getVocabularyById(normalized);
  if (exact) return exact.id;

  // wooden → wood, diamonds → diamond
  const stems = [normalized.replace(/s$/, ""), normalized.replace(/en$/, "")];
  for (const stem of stems) {
    if (stem !== normalized && getVocabularyById(stem)) return stem;
  }
  return undefined;
}

/** Primary unknown focus word for a speak-attack encounter. */
export function getUnknownAttackWordId(
  wordId: string,
  learnedWordIds: string[],
  masteredWordIds: string[] = [],
): string | null {
  return isUnknownWord(wordId, learnedWordIds, masteredWordIds) ? wordId : null;
}

/** First unknown focus word among craft recipe / speech keywords. */
export function getUnknownCraftWordId(
  weaponId: WeaponTierId,
  learnedWordIds: string[],
  masteredWordIds: string[] = [],
): string | null {
  const weapon = getWeaponTierById(weaponId);
  if (!weapon) return null;

  const candidates: string[] = [
    ...weapon.costs.map((c) => c.resource),
    ...weapon.speechKeywords,
  ];

  for (const raw of candidates) {
    const id = resolveVocabIdFromKeyword(raw);
    if (id && isUnknownWord(id, learnedWordIds, masteredWordIds)) return id;
  }
  return null;
}

/** First unknown focus word among trade wordIds. */
export function getUnknownTradeWordId(
  tradeId: string,
  learnedWordIds: string[],
  masteredWordIds: string[] = [],
): string | null {
  const offer = getTradeOfferById(tradeId);
  if (!offer) return null;
  for (const id of offer.wordIds) {
    if (isUnknownWord(id, learnedWordIds, masteredWordIds)) return id;
  }
  return null;
}

/**
 * Very lenient repeat check after a phonics listen moment.
 * Accepts full word, stem, or a clear leading chunk of the word.
 */
export function scorePhonicsRepeatAttempt(
  transcript: string,
  expectedEnglish: string,
): { passed: boolean; matched: string | null } {
  const heard = transcript.trim().toLowerCase();
  const expected = expectedEnglish.trim().toLowerCase();
  if (!heard || !expected) return { passed: false, matched: null };

  if (heard.includes(expected)) {
    return { passed: true, matched: expected };
  }

  const tokens = expected.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (token.length >= 2 && heard.includes(token)) {
      return { passed: true, matched: token };
    }
    // Kid approximate: "zom" / "zomb" counts for zombie.
    if (token.length >= 3 && heard.length >= 3) {
      if (token.startsWith(heard) || heard.startsWith(token.slice(0, 3))) {
        return { passed: true, matched: heard.slice(0, 3) };
      }
      const prefix = token.slice(0, Math.min(4, token.length));
      if (heard.includes(prefix) || prefix.startsWith(heard)) {
        return { passed: true, matched: prefix };
      }
    }
  }

  return { passed: false, matched: null };
}

/**
 * Post-phonics speak scoring: full phrase OR any one keyword
 * (even when the normal attack ladder wants ≥2 keywords).
 */
export function scoreSpeechAfterPhonics(
  transcript: string,
  expectedText: string,
  keywords: string[],
): { passed: boolean; matchedKeywords: string[] } {
  const normalized = transcript.toLowerCase();
  const matchedKeywords = keywords.filter((kw) =>
    normalized.includes(kw.toLowerCase()),
  );
  const expectedMatch = normalized.includes(expectedText.toLowerCase());
  // Also accept a short prefix of the longest keyword (kid approximate).
  const longest = [...keywords].sort((a, b) => b.length - a.length)[0];
  let prefixHit = false;
  if (longest && longest.length >= 4) {
    const prefix = longest.toLowerCase().slice(0, 4);
    prefixHit = normalized.includes(prefix);
  }
  return {
    passed: expectedMatch || matchedKeywords.length >= 1 || prefixHit,
    matchedKeywords,
  };
}

/** Re-score fluency after a phonics boost — word rung only needs a soft hit. */
export function scoreFluencyAfterPhonics(
  transcript: string,
  wordId: string,
  expectedWord: string,
  keywords: string[],
): boolean {
  const soft = scoreSpeechAfterPhonics(transcript, expectedWord, keywords);
  if (soft.passed) return true;
  const plan = getPhonicsPlan(wordId);
  if (!plan) return false;
  return scorePhonicsRepeatAttempt(transcript, plan.english).passed;
}

export function phonicsChunkKey(chunk: PhonicsChunk, index: number): string {
  return `${chunk.grapheme}-${index}`;
}

/** Tiny helper for tests / debug — join chunks without separators. */
export function joinPhonicsChunks(chunks: PhonicsChunk[]): string {
  return chunks
    .filter((c) => c.grapheme !== "·")
    .map((c) => c.grapheme)
    .join("");
}

export function mentionsExpectedWord(
  transcript: string,
  english: string,
): boolean {
  const pattern = new RegExp(`\\b${escapeRegex(english.toLowerCase())}\\b`);
  return pattern.test(transcript.toLowerCase());
}
