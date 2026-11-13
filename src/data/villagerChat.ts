/**
 * Hub villager deep-chat (MW-44 / P1-1).
 * 2–3 speak turns that reuse the speak-trade contract (lenient keywords + TTS),
 * then hand off to the existing SpeakTradePanel offers — not a standalone /speak island.
 */

export type VillagerChatTurn = {
  id: string;
  /** Villager NPC line before the kid speaks. */
  npcLine: string;
  npcLineCn: string;
  expectedSpeech: string;
  /** Lenient keywords — same as speak-trade (any one hit passes). */
  speechKeywords: string[];
  speechHintCn: string;
  speechHintEn: string;
  /** Word ids marked learned when this turn passes. */
  wordIds: string[];
};

export const VILLAGER_CHAT_STORAGE_KEY = "minewords-villager-chat-v1";

/** Greeting → need → trade invite (3 turns). */
export const villagerChatTurns: VillagerChatTurn[] = [
  {
    id: "villager-hello",
    npcLine: "Hello! Welcome to my village stall.",
    npcLineCn: "你好！欢迎来到我的村庄摊位。",
    expectedSpeech: "Hello villager",
    speechKeywords: ["hello", "hi", "villager", "trade"],
    speechHintCn: "说 hello / hi / villager，或 Hello villager",
    speechHintEn: "Say hello, hi, villager, or Hello villager",
    wordIds: ["villager"],
  },
  {
    id: "villager-need",
    npcLine: "What do you need today?",
    npcLineCn: "你今天需要什么？",
    expectedSpeech: "I want to trade",
    speechKeywords: ["want", "need", "trade", "buy", "diamond", "emerald"],
    speechHintCn: "说 want / trade / buy / diamond，或 I want to trade",
    speechHintEn: "Say want, trade, buy, diamond, or I want to trade",
    wordIds: ["trade", "diamond"],
  },
  {
    id: "villager-lets-trade",
    npcLine: "Great! Say let's trade, then pick an offer below.",
    npcLineCn: "太好了！说 let's trade，再选下面的报价。",
    expectedSpeech: "Let's trade",
    speechKeywords: ["lets", "let's", "trade", "buy", "please"],
    speechHintCn: "说 trade / buy，或 Let's trade",
    speechHintEn: "Say trade, buy, or Let's trade",
    wordIds: ["trade", "villager"],
  },
  // MW-57: optional deep-chat beat for farm words (not on fight surface).
  {
    id: "villager-farm",
    npcLine: "Growing a mini farm? Say farm, wheat, or carrot!",
    npcLineCn: "要种迷你农场吗？开口说 farm / wheat / carrot！",
    expectedSpeech: "I want to farm wheat",
    speechKeywords: ["farm", "wheat", "carrot"],
    speechHintCn: "说 farm / wheat / carrot，或整句 I want to farm wheat",
    speechHintEn: "Say farm, wheat, carrot, or I want to farm wheat",
    wordIds: ["farm", "wheat", "carrot"],
  },
];

export function getVillagerChatTurn(index: number): VillagerChatTurn | undefined {
  return villagerChatTurns[index];
}

export function villagerChatTurnCount(): number {
  return villagerChatTurns.length;
}

/** Completed deep-chat turn count from hub localStorage (MW-55 weekly challenge). */
export function countCompletedVillagerChatTurns(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(VILLAGER_CHAT_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return 0;
    const ids = new Set(
      parsed.filter((id): id is string => typeof id === "string"),
    );
    return villagerChatTurns.filter((turn) => ids.has(turn.id)).length;
  } catch {
    return 0;
  }
}
