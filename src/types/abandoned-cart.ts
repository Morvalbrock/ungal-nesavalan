import type { CartItem } from "@/features/cart/cart.types";

export interface AbandonedCart {
  id: string;
  userId: string;
  email: string;
  items: CartItem[];
  subtotalPaise: number;
  createdAt: string;
  updatedAt: string;
  recoveredOrderId?: string;
  notifiedAt?: string;
}
