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
  createdAt: string;
  updatedAt: string;
}
