import type { Category } from "@/types/category";

export const GLOBAL_COD = {
  minOrderPaise: 100000,
  minDepositPaise: 9900,
  depositPct: 0.10
} as const;

export interface CodCartLine {
  productId: string;
  categoryId: string;
  linePaise: number;
}

export interface CodQuote {
  eligible: boolean;
  depositPaise: number;
  dueOnDeliveryPaise: number;
  minOrderPaise: number;
  reason?: "below_min_order";
}

interface Rule {
  type: "percent" | "fixed";
  value: number;
  minOrderPaise: number;
}

const GLOBAL_RULE: Rule = {
  type: "percent",
  value: GLOBAL_COD.depositPct * 100,
  minOrderPaise: GLOBAL_COD.minOrderPaise
};

function ruleForCategory(cat: Category | undefined): Rule {
  if (!cat) return GLOBAL_RULE;
  const type = cat.codAdvanceType;
  const value = cat.codAdvanceValue;
  const minOrder = cat.codMinOrderPaise;
  const rule: Rule = {
    type: type ?? GLOBAL_RULE.type,
    value: typeof value === "number" && value >= 0 ? value : GLOBAL_RULE.value,
    minOrderPaise:
      typeof minOrder === "number" && minOrder >= 0 ? minOrder : GLOBAL_RULE.minOrderPaise
  };
  return rule;
}

function advanceForLine(linePaise: number, rule: Rule): number {
  if (linePaise <= 0) return 0;
  const raw =
    rule.type === "percent"
      ? Math.ceil((linePaise * rule.value) / 100)
      : Math.min(rule.value, linePaise);
  return Math.max(raw, 0);
}

export function computeCodDepositForCart(
  lines: CodCartLine[],
  categoryById: Map<string, Category>,
  payablePaise: number
): CodQuote {
  if (lines.length === 0 || payablePaise <= 0) {
    return {
      eligible: false,
      depositPaise: 0,
      dueOnDeliveryPaise: 0,
      minOrderPaise: GLOBAL_COD.minOrderPaise,
      reason: "below_min_order"
    };
  }

  // Resolve per-line rule; take the strictest min-order across the cart.
  let maxMinOrder = 0;
  let maxAdvance = 0;
  for (const line of lines) {
    const rule = ruleForCategory(categoryById.get(line.categoryId));
    if (rule.minOrderPaise > maxMinOrder) maxMinOrder = rule.minOrderPaise;
    const adv = advanceForLine(line.linePaise, rule);
    if (adv > maxAdvance) maxAdvance = adv;
  }

  if (payablePaise < maxMinOrder) {
    return {
      eligible: false,
      depositPaise: 0,
      dueOnDeliveryPaise: 0,
      minOrderPaise: maxMinOrder,
      reason: "below_min_order"
    };
  }

  // Floor on the deposit; cap at the full payable so we never exceed the order.
  const deposit = Math.min(Math.max(maxAdvance, GLOBAL_COD.minDepositPaise), payablePaise);
  return {
    eligible: true,
    depositPaise: deposit,
    dueOnDeliveryPaise: Math.max(0, payablePaise - deposit),
    minOrderPaise: maxMinOrder
  };
}
