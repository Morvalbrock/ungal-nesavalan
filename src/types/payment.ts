export type PaymentStatus = "created" | "authorized" | "captured" | "failed" | "refunded";

export interface Payment {
  id: string;
  orderId: string;
  provider: "razorpay";
  providerOrderId: string;
  providerPaymentId?: string;
  amountPaise: number;
  currency: "INR";
  status: PaymentStatus;
  signature?: string;
  rawWebhookLog?: string;
  createdAt: string;
  updatedAt: string;
}
