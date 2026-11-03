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
  preferredCourier?: string;
  trackingId?: string;
  courier?: string;
  notifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}
