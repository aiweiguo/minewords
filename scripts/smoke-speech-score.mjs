/**
 * MW-62 smoke: lenient keyword speech scoring helpers.
 * Mirrors src/lib/speechRecognition.ts (no bundler).
 * Run: node scripts/smoke-speech-score.mjs
 */
import assert from "node:assert/strict";

function matchSpeechKeywords(normalizedTranscript, keywords) {
  const hits = keywords.filter((kw) =>
    normalizedTranscript.includes(kw.toLowerCase()),
  );
  const kept = [];
  for (const kw of [...hits].sort((a, b) => b.length - a.length)) {
    const lower = kw.toLowerCase();
    const nested = kept.some((k) => {
      const keptLower = k.toLowerCase();
      return keptLower.includes(lower) || lower.includes(keptLower);
    });
    if (!nested) kept.push(kw);
  }
  return kept;
}

function scoreSpeechAttempt(transcript, expectedText, keywords) {
  const normalized = transcript.toLowerCase();
  const matchedKeywords = matchSpeechKeywords(normalized, keywords);
  const expectedMatch = normalized.includes(expectedText.toLowerCase());
  const keywordMatch =
    keywords.length > 0 &&
    matchedKeywords.length >= Math.min(2, keywords.length);
  return {
    passed: expectedMatch || keywordMatch,
    matchedKeywords,
  };
}

function scoreCraftSpeechAttempt(
  transcript,
  expectedText,
  keywords,
  minKeywords = 1,
) {
  const normalized = transcript.toLowerCase();
  const matchedKeywords = matchSpeechKeywords(normalized, keywords);
  const expectedMatch = normalized.includes(expectedText.toLowerCase());
  const needed = Math.max(1, Math.min(minKeywords, keywords.length || 1));
  return {
    passed: expectedMatch || matchedKeywords.length >= needed,
    matchedKeywords,
  };
}

function craftSpeechMinKeywords(weaponId) {
  return weaponId === "iron-sword" || weaponId === "diamond-sword" ? 2 : 1;
}

function tradeSpeechMinKeywords(offerId) {
  return offerId === "buy-diamonds" ||
    offerId === "iron-for-diamond" ||
    offerId === "boat-for-ocean" ||
    offerId === "bed-to-sleep"
    ? 2
    : 1;
}

// Nested stems: "diamonds" must not count as both diamond + diamonds.
const nested = matchSpeechKeywords("i want diamonds please", [
  "diamond",
  "diamonds",
  "want",
]);
assert.deepEqual(
  nested.sort(),
  ["diamonds", "want"].sort(),
  "nested diamond/diamonds collapse to longer stem",
);

// Attack ladder: 0 keywords → fail; full phrase → pass; 2 keywords → pass.
assert.equal(
  scoreSpeechAttempt("um", "wooden sword", ["wood", "sword"]).passed,
  false,
);
assert.equal(
  scoreSpeechAttempt("wooden sword!", "wooden sword", ["wood", "sword"])
    .passed,
  true,
);
assert.equal(
  scoreSpeechAttempt("wood and sword", "wooden sword", ["wood", "sword"])
    .passed,
  true,
);
assert.equal(
  scoreSpeechAttempt("wood only", "wooden sword", ["wood", "sword"]).passed,
  false,
  "single keyword fails attack ladder when 2+ keywords exist",
);

// Early craft stays lenient (minKeywords=1).
assert.equal(
  scoreCraftSpeechAttempt("wood", "wooden sword", ["wood", "stick", "sword"], 1)
    .passed,
  true,
);

// Post-iron craft needs ≥2 keywords unless full phrase.
assert.equal(craftSpeechMinKeywords("wooden-sword"), 1);
assert.equal(craftSpeechMinKeywords("stone-sword"), 1);
assert.equal(craftSpeechMinKeywords("iron-sword"), 2);
assert.equal(craftSpeechMinKeywords("diamond-sword"), 2);

const ironKw = ["craft", "iron", "sword"];
assert.equal(
  scoreCraftSpeechAttempt("iron", "I craft an iron sword", ironKw, 2).passed,
  false,
  "one keyword fails iron craft gate",
);
assert.equal(
  scoreCraftSpeechAttempt("iron sword", "I craft an iron sword", ironKw, 2)
    .passed,
  true,
);
assert.equal(
  scoreCraftSpeechAttempt(
    "I craft an iron sword",
    "I craft an iron sword",
    ironKw,
    2,
  ).passed,
  true,
  "full phrase always passes",
);

assert.equal(tradeSpeechMinKeywords("wood-for-emerald"), 1);
assert.equal(tradeSpeechMinKeywords("buy-diamonds"), 2);
assert.equal(tradeSpeechMinKeywords("boat-for-ocean"), 2);

console.log("MW-62 speech-score smoke OK", {
  nested,
  craftMin: {
    wood: craftSpeechMinKeywords("wooden-sword"),
    iron: craftSpeechMinKeywords("iron-sword"),
  },
});
