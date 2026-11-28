import type { Address } from "./address";
import type { CouponSnapshot } from "./coupon";

export type OrderStatus =
  | "pending"
  | "paid"
  | "packed"
  | "shipped"
  | "delivered"
  | "return_requested"
  | "cancelled"
  | "refunded";

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending",
  "paid",
  "packed",
  "shipped",
  "delivered"
];

export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  // Pending orders cannot be advanced to packed/shipped/delivered; only payment gateway verifies payment to 'paid'
  pending: ["cancelled"],
  // Paid orders can be packed or cancelled
  paid: ["packed", "cancelled"],
  // Packed orders can be shipped or cancelled
  packed: ["shipped", "cancelled"],
  // Shipped orders can be delivered or cancelled
  shipped: ["delivered", "cancelled"],
  // Delivered orders can only be refunded
  delivered: ["refunded"],
  return_requested: ["refunded", "delivered"],
  cancelled: [],
  refunded: []
};

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productNameSnapshot: string;
  variantLabelSnapshot: string;
  /**
   * Snapshot of the customer-selected size at order time. Absent for products
   * that had no admin-configured sizes, or for historical orders predating this
   * field — consumers should treat missing/empty as "no size chosen".
   */
  sizeSnapshot?: string;
  imageSnapshot: string;
  unitPricePaise: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  addressSnapshot: Omit<Address, "id" | "userId" | "isDefault">;
  status: OrderStatus;
  subtotalPaise: number;
  shippingPaise: number;
  taxPaise: number;
  discountPaise: number;
  couponSnapshot?: CouponSnapshot;
  totalPaise: number;
  currency: "INR";
  paymentId?: string;
  notes?: string;
  paymentMode?: "prepaid" | "cod";
  amountPaidPaise?: number;
  amountDuePaise?: number;
  codDepositPaise?: number;
  codCollectedAt?: string;
  preferredCourier?: string;
  trackingId?: string;
  courier?: string;
  notifiedAt?: string;
  /**
   * True when the order was placed via the guest-checkout flow (no login / OTP).
   * Older orders predate this flag, so absence should be treated as "registered".
   */
  isGuestOrder?: boolean;
  /**
   * Client-generated UUID issued once per checkout attempt. Reused across retries
   * so the server can short-circuit duplicate POSTs (double-clicks, flaky retries)
   * and return the original order+payment instead of creating a second one.
   */
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
}
