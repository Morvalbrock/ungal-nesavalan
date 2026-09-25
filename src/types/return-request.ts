export type ReturnDecision = "approved" | "rejected";

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  note: string;
  requestedAt: string;
  decidedAt?: string;
  decision?: ReturnDecision;
  adminNote?: string;
  refundId?: string;
}

export const RETURN_REASONS = [
  "damaged",
  "wrong_item",
  "not_as_described",
  "size_fit",
  "changed_mind",
  "other"
] as const;
export type ReturnReason = (typeof RETURN_REASONS)[number];
