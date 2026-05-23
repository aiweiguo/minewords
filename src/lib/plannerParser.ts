import { materialPlans } from "@/data/materialPlans";

export type PlannerParseResult =
  | {
      ok: true;
      planId: string;
      multiplier: number;
      matchedText: string;
    }
  | {
      ok: false;
      error: string;
    };

const chineseNumerals: Record<string, number> = {
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};

const quantityPattern =
  /([一二两三四五六七八九十\d]+)\s*(?:把|个|张|根|块|×|x|X|\*)?\s*(.+)|(?:做|建|造|需要|想要|想)?\s*([一二两三四五六七八九十\d]+)\s*(.+)/;

function normalizeQuery(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "");
}

function parseQuantityToken(token: string): number {
  if (/^\d+$/.test(token)) {
    return Number(token);
  }
  if (token.length === 1 && chineseNumerals[token]) {
    return chineseNumerals[token];
  }
  if (token === "十") return 10;
  if (token.startsWith("十") && chineseNumerals[token[1]]) {
    return 10 + chineseNumerals[token[1]];
  }
  if (token.endsWith("十") && chineseNumerals[token[0]]) {
    return chineseNumerals[token[0]] * 10;
  }
  return 1;
}

function extractQuantity(text: string): { multiplier: number; rest: string } {
  const match = text.match(quantityPattern);
  if (!match) {
    return { multiplier: 1, rest: text };
  }
  const rawQty = match[1] ?? match[3] ?? "1";
  const qty = parseQuantityToken(rawQty);
  const rest = (match[2] ?? match[4] ?? text).trim();
  return { multiplier: Number.isFinite(qty) && qty > 0 ? qty : 1, rest };
}

function scoreAliasMatch(query: string, alias: string): number {
  const q = normalizeQuery(query);
  const a = normalizeQuery(alias);
  if (!q || !a) return 0;
  if (q === a) return 100;
  if (q.includes(a) && a.length >= 2) return 60 + a.length;
  if (a.includes(q) && q.length >= 2) return 40 + q.length;
  return 0;
}

export function parsePlannerQuery(input: string): PlannerParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "请输入想制作的内容，例如：3 把钻石剑" };
  }

  const { multiplier, rest } = extractQuantity(trimmed);
  const queryText = rest || trimmed;

  let best: { planId: string; score: number; titleCn: string } | null = null;

  for (const plan of materialPlans) {
    const aliases = [
      plan.titleCn,
      plan.title,
      plan.id,
      ...(plan.queryAliases ?? []),
    ];
    for (const alias of aliases) {
      const score = scoreAliasMatch(queryText, alias);
      if (!best || score > best.score) {
        best = { planId: plan.id, score, titleCn: plan.titleCn };
      }
    }
  }

  if (!best || best.score < 40) {
    const hints = materialPlans
      .slice(0, 4)
      .map((plan) => plan.titleCn)
      .join("、");
    return {
      ok: false,
      error: `没听懂这个计划。试试：${hints}`,
    };
  }

  return {
    ok: true,
    planId: best.planId,
    multiplier,
    matchedText: `${multiplier > 1 ? `${multiplier}× ` : ""}${best.titleCn}`,
  };
}
