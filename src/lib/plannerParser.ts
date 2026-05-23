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

const quantityPattern =
  /(\d+)\s*(?:把|个|张|根|块|×|x|X|\*)?\s*(.+)|(?:做|建|造|需要|想要|想)?\s*(\d+)\s*(.+)/;

function normalizeQuery(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "");
}

function extractQuantity(text: string): { multiplier: number; rest: string } {
  const match = text.match(quantityPattern);
  if (!match) {
    return { multiplier: 1, rest: text };
  }
  const qty = Number(match[1] ?? match[3] ?? 1);
  const rest = (match[2] ?? match[4] ?? text).trim();
  return { multiplier: Number.isFinite(qty) && qty > 0 ? qty : 1, rest };
}

function matchesAlias(query: string, alias: string): boolean {
  const q = normalizeQuery(query);
  const a = normalizeQuery(alias);
  return q.includes(a) || a.includes(q);
}

export function parsePlannerQuery(input: string): PlannerParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "请输入想制作的内容，例如：3 把钻石剑" };
  }

  const { multiplier, rest } = extractQuantity(trimmed);
  const queryText = rest || trimmed;

  for (const plan of materialPlans) {
    const aliases = [
      plan.titleCn,
      plan.title,
      plan.id,
      ...(plan.queryAliases ?? []),
    ];
    if (aliases.some((alias) => matchesAlias(queryText, alias))) {
      return {
        ok: true,
        planId: plan.id,
        multiplier,
        matchedText: `${multiplier > 1 ? `${multiplier}× ` : ""}${plan.titleCn}`,
      };
    }
  }

  const hints = materialPlans
    .slice(0, 4)
    .map((plan) => plan.titleCn)
    .join("、");

  return {
    ok: false,
    error: `没听懂这个计划。试试：${hints}`,
  };
}
