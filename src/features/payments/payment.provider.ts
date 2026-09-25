export type PaymentMode = "razorpay" | "simulate";

export interface CreatedProviderOrder {
  providerOrderId: string;
  keyId: string;
  amountPaise: number;
  currency: "INR";
  mode: PaymentMode;
}

export interface CreatedRefund {
  refundId: string;
  amountPaise: number;
  status: "pending" | "processed" | "failed";
  mode: PaymentMode;
}

export interface PaymentProvider {
  readonly mode: PaymentMode;
  createOrder(input: {
    amountPaise: number;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<CreatedProviderOrder>;

  /** Verifies the client-side handler signature (razorpay_order_id | razorpay_payment_id). */
  verifyPaymentSignature(input: {
    providerOrderId: string;
    providerPaymentId: string;
    signature: string;
  }): boolean;

  /** Verifies the HMAC-SHA256 signature on a raw webhook body. */
  verifyWebhook(rawBody: string, signature: string): boolean;

  /** Issues a full or partial refund against a captured payment. */
  refund(input: {
    providerPaymentId: string;
    amountPaise: number;
    notes?: Record<string, string>;
  }): Promise<CreatedRefund>;
}
