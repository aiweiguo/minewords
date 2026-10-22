import { SentencePattern } from "@/types";

export const sentencePatterns: SentencePattern[] = [
  {
    id: "i-need",
    patternEn: "I need ...",
    patternCn: "我需要……",
    examples: [
      { english: "I need wood.", chinese: "我需要木头。", wordIds: ["wood"] },
      { english: "I need a sword.", chinese: "我需要一把剑。", wordIds: ["sword"] },
      { english: "I need bread.", chinese: "我需要面包。", wordIds: ["bread"] },
    ],
  },
  {
    id: "i-found",
    patternEn: "I found ...",
    patternCn: "我找到了……",
    examples: [
      { english: "I found a diamond.", chinese: "我找到了一颗钻石。", wordIds: ["diamond"] },
      { english: "I found iron in the cave.", chinese: "我在洞穴里找到了铁。", wordIds: ["iron", "cave"] },
    ],
  },
  {
    id: "i-use-to",
    patternEn: "I use ... to ...",
    patternCn: "我用……来……",
    examples: [
      {
        english: "I use a pickaxe to mine stone.",
        chinese: "我用镐挖石头。",
        wordIds: ["pickaxe", "mine", "stone"],
      },
      {
        english: "I use a sword to fight zombies.",
        chinese: "我用剑打僵尸。",
        wordIds: ["sword", "fight", "zombie"],
      },
    ],
  },
  {
    id: "lets-build",
    patternEn: "Let's build ...",
    patternCn: "我们来建造……",
    examples: [
      { english: "Let's build a house.", chinese: "我们来建一座房子。", wordIds: ["build", "house"] },
      { english: "Let's build a farm.", chinese: "我们来建一个农场。", wordIds: ["build", "farm"] },
    ],
  },
  {
    id: "watch-out",
    patternEn: "Watch out!",
    patternCn: "小心！",
    examples: [
      { english: "Watch out!", chinese: "小心！", wordIds: ["watch"] },
      { english: "Watch out! A creeper!", chinese: "小心！苦力怕！", wordIds: ["creeper"] },
    ],
  },
  {
    id: "i-have",
    patternEn: "I have ...",
    patternCn: "我有……",
    examples: [
      { english: "I have an emerald.", chinese: "我有一个绿宝石。", wordIds: ["emerald"] },
      { english: "I have a diamond sword.", chinese: "我有一把钻石剑。", wordIds: ["diamond", "sword"] },
    ],
  },
  {
    id: "lets-explore",
    patternEn: "Let's explore ...",
    patternCn: "我们来探索……",
    examples: [
      {
        english: "Let's explore the nether.",
        chinese: "我们来探索下界。",
        wordIds: ["explore", "nether"],
      },
      {
        english: "Let's explore the ocean.",
        chinese: "我们来探索海洋。",
        wordIds: ["explore", "ocean"],
      },
    ],
  },
  {
    id: "i-protect",
    patternEn: "I protect ...",
    patternCn: "我保护……",
    examples: [
      {
        english: "I protect my house.",
        chinese: "我保护我的房子。",
        wordIds: ["protect", "house"],
      },
      {
        english: "I protect the village.",
        chinese: "我保护村庄。",
        wordIds: ["protect", "village"],
      },
    ],
  },
];

export function getSentencePatternForKeywords(keywords: string[]): SentencePattern | undefined {
  const normalized = keywords.map((kw) => kw.toLowerCase());
  return sentencePatterns.find((pattern) =>
    pattern.examples.some((example) =>
      example.wordIds.some((wordId) => normalized.includes(wordId.toLowerCase())),
    ),
  );
}
