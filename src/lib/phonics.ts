import { getDecorBonusLearnWordIds } from "@/data/decorationSpeak";
import { getTradeOfferById } from "@/data/trades";
import { getVocabularyById } from "@/data/vocabulary";
import { getWeaponTierById, WeaponTierId } from "@/data/weapons";

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

/** Compound / multi-token part with dictionary IPA when available. */
export type PhonicsPart = {
  word: string;
  chinese?: string;
  phonetic?: string;
};

export type PhonicsPlan = {
  wordId: string;
  english: string;
  chinese: string;
  /** Top-level dictionary IPA (reused from vocabulary). */
  phonetic?: string;
  /** Per-part dictionary IPA for compounds / multi-word entries. */
  parts: PhonicsPart[];
  chunks: PhonicsChunk[];
  /** Full-word TTS / repeat target. */
  demoText: string;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Prefer entry phonetic; else look up the part word in the dictionary. */
export function resolveDictionaryPhonetic(
  word: string,
  explicit?: string,
): string | undefined {
  if (explicit && explicit.trim()) return explicit.trim();
  const id = resolveVocabIdFromKeyword(word);
  if (!id) return undefined;
  return getVocabularyById(id)?.phonetic;
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
 * Reuses dictionary `phonetic` (top-level + compound `words[].phonetic`).
 */
export function getPhonicsPlan(wordId: string): PhonicsPlan | null {
  const word = getVocabularyById(wordId);
  if (!word) return null;

  const english = word.english;
  const demoText = english;

  let parts: PhonicsPart[];
  let chunks: PhonicsChunk[];

  if (word.words && word.words.length > 0) {
    parts = word.words.map((part) => ({
      word: part.word,
      chinese: part.chinese,
      phonetic: resolveDictionaryPhonetic(part.word, part.phonetic),
    }));
    chunks = word.words.flatMap((part, index) => {
      const partChunks = chunkGraphemes(part.word);
      if (index === 0 || partChunks.length === 0) return partChunks;
      return [{ grapheme: "·", say: "" }, ...partChunks];
    });
  } else {
    const tokens = english.split(/\s+/).filter(Boolean);
    parts = tokens.map((token) => ({
      word: token,
      phonetic: resolveDictionaryPhonetic(token),
    }));
    // Single-token entries: keep one part with the top-level IPA.
    if (parts.length === 1 && !parts[0]!.phonetic && word.phonetic) {
      parts = [{ word: tokens[0] ?? english, phonetic: word.phonetic }];
    }
    chunks = tokens.flatMap((token, index) => {
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
    phonetic: word.phonetic ?? parts.find((p) => p.phonetic)?.phonetic,
    parts,
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

/** Tokens used to detect whether a transcript already said this word. */
function hearingTokensForWordId(wordId: string): string[] {
  const word = getVocabularyById(wordId);
  if (!word) return [wordId];
  const tokens = new Set<string>();
  tokens.add(word.id.toLowerCase());
  tokens.add(word.english.toLowerCase());
  for (const part of word.english.toLowerCase().split(/\s+/)) {
    if (part.length >= 2) tokens.add(part);
  }
  for (const part of word.words ?? []) {
    if (part.word.length >= 2) tokens.add(part.word.toLowerCase());
  }
  return [...tokens];
}

/**
 * Pick the unknown focus word that best matches a speech miss.
 * Prefers candidates the kid did NOT say in the transcript.
 */
export function pickMissFocusWordId(
  transcript: string | null | undefined,
  candidateWordIds: string[],
  learnedWordIds: string[],
  masteredWordIds: string[] = [],
): string | null {
  const unknown = candidateWordIds.filter((id) =>
    isUnknownWord(id, learnedWordIds, masteredWordIds),
  );
  if (unknown.length === 0) return null;

  const heard = (transcript ?? "").trim().toLowerCase();
  if (!heard) return unknown[0] ?? null;

  const notHeard = unknown.filter((id) => {
    const tokens = hearingTokensForWordId(id);
    return !tokens.some((token) => token.length >= 2 && heard.includes(token));
  });
  return notHeard[0] ?? unknown[0] ?? null;
}

/** Ordered vocab ids for a speak-attack encounter (monster + MW-57 decor weaves). */
export function listAttackFocusWordIds(wordId: string): string[] {
  if (!wordId) return [];
  const bonus = getDecorBonusLearnWordIds(wordId);
  return [wordId, ...bonus];
}

/** Ordered vocab ids for craft recipe costs + speech keywords. */
export function listCraftFocusWordIds(weaponId: WeaponTierId): string[] {
  const weapon = getWeaponTierById(weaponId);
  if (!weapon) return [];

  const candidates: string[] = [
    ...weapon.costs.map((c) => c.resource),
    ...weapon.speechKeywords,
  ];

  const ids: string[] = [];
  const seen = new Set<string>();
  for (const raw of candidates) {
    const id = resolveVocabIdFromKeyword(raw);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

/** Ordered vocab ids for a trade offer. */
export function listTradeFocusWordIds(tradeId: string): string[] {
  const offer = getTradeOfferById(tradeId);
  if (!offer) return [];
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const id of offer.wordIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
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
  return pickMissFocusWordId(
    null,
    listCraftFocusWordIds(weaponId),
    learnedWordIds,
    masteredWordIds,
  );
}

/** First unknown focus word among trade wordIds. */
export function getUnknownTradeWordId(
  tradeId: string,
  learnedWordIds: string[],
  masteredWordIds: string[] = [],
): string | null {
  return pickMissFocusWordId(
    null,
    listTradeFocusWordIds(tradeId),
    learnedWordIds,
    masteredWordIds,
  );
}

/**
 * Resolve which unknown word to teach after a speech miss with a transcript.
 * Falls back to the host's default unknown focus.
 */
export function resolveMissPhonicsWordId(options: {
  transcript: string | null | undefined;
  candidateWordIds: string[];
  learnedWordIds: string[];
  masteredWordIds?: string[];
  fallbackWordId?: string | null;
}): string | null {
  const picked = pickMissFocusWordId(
    options.transcript,
    options.candidateWordIds,
    options.learnedWordIds,
    options.masteredWordIds ?? [],
  );
  return picked ?? options.fallbackWordId ?? null;
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
