import type { OrderItem } from "@/types/order";
import type { Product, Variant } from "@/types/product";
import { productRepo } from "@/server/repositories";
import { newId } from "@/server/db/json-store";
import { shippingQuote } from "@/features/shipping/calculate";
import type { ShippingZone } from "@/features/shipping/zones";

type BuiltItem = Omit<OrderItem, "orderId">;

export interface CartLinePayload {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface BuiltOrderTotals {
  items: BuiltItem[];
  subtotalPaise: number;
  shippingPaise: number;
  shippingZone: ShippingZone;
  totalPaise: number;
}

export class OrderBuildError extends Error {
  readonly code:
    | "empty_cart"
    | "product_missing"
    | "variant_missing"
    | "out_of_stock"
    | "insufficient_stock";
  constructor(code: OrderBuildError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

function priceOf(product: Product, variant: Variant): number {
  return variant.priceOverride ?? product.salePrice ?? product.basePrice;
}

export async function buildOrderFromCart(
  lines: CartLinePayload[],
  opts: { pincode?: string | null } = {}
): Promise<BuiltOrderTotals> {
  if (!lines.length) throw new OrderBuildError("empty_cart", "Cart is empty");

  const uniqueProductIds = Array.from(new Set(lines.map((l) => l.productId)));
  const products = await Promise.all(uniqueProductIds.map((id) => productRepo.findById(id)));
  const productMap = new Map<string, Product>();
  products.forEach((p) => p && productMap.set(p.id, p));

  const items: BuiltItem[] = [];
  let subtotal = 0;

  for (const line of lines) {
    const product = productMap.get(line.productId);
    if (!product) throw new OrderBuildError("product_missing", `Product ${line.productId} not found`);
    const variant = product.variants.find((v) => v.id === line.variantId);
    if (!variant) throw new OrderBuildError("variant_missing", `Variant ${line.variantId} not found`);
    if (variant.stock <= 0) throw new OrderBuildError("out_of_stock", `${product.name} — ${variant.color} is sold out`);
    if (variant.stock < line.quantity) {
      throw new OrderBuildError(
        "insufficient_stock",
        `Only ${variant.stock} ${product.name} (${variant.color}) available`
      );
    }
    const unit = priceOf(product, variant);
    subtotal += unit * line.quantity;
    items.push({
      id: newId("oi"),
      productId: product.id,
      variantId: variant.id,
      productNameSnapshot: product.name,
      variantLabelSnapshot: variant.color,
      imageSnapshot: product.images[0]?.url ?? "",
      unitPricePaise: unit,
      quantity: line.quantity
    });
  }

  const quote = shippingQuote({ subtotalPaise: subtotal, pincode: opts.pincode });
  return {
    items,
    subtotalPaise: subtotal,
    shippingPaise: quote.ratePaise,
    shippingZone: quote.zone,
    totalPaise: subtotal + quote.ratePaise
  };
}
