import type { PaymentProvider } from "./payment.provider";

export function createSimulateProvider(): PaymentProvider {
  return {
    mode: "simulate",
    async createOrder({ amountPaise, receipt }) {
      const providerOrderId = `sim_order_${Date.now()}_${receipt}`;
      return {
        providerOrderId,
        keyId: "sim_key",
        amountPaise,
        currency: "INR",
        mode: "simulate"
      };
    },
    verifyPaymentSignature({ signature }) {
      return signature === "simulated";
    },
    verifyWebhook() {
      return false;
    },
    async refund({ amountPaise }) {
      return {
        refundId: `sim_rfnd_${Date.now()}`,
        amountPaise,
        status: "processed",
        mode: "simulate"
      };
    }
  };
}
