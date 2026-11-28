import type { OrderItem } from "@/types/order";
import type { Product, Variant } from "@/types/product";
import { productRepo, shippingChargesRepo } from "@/server/repositories";
import { newId } from "@/server/db/json-store";
import { shippingEta } from "@/features/shipping/calculate";
import { computeShipping } from "@/features/shipping/compute-shipping";
import type { ShippingZone } from "@/features/shipping/zones";
import type { CodCartLine } from "./cod";

type BuiltItem = Omit<OrderItem, "orderId">;

export interface CartLinePayload {
  productId: string;
  variantId: string;
  quantity: number;
  /** Admin-configured size picked by the customer (if the product has sizes). */
  size?: string;
}

export interface BuiltOrderTotals {
  items: BuiltItem[];
  codLines: CodCartLine[];
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
    | "insufficient_stock"
    | "size_required"
    | "invalid_size";
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
  opts: { pincode?: string | null; state?: string | null } = {}
): Promise<BuiltOrderTotals> {
  if (!lines.length) throw new OrderBuildError("empty_cart", "Cart is empty");

  const uniqueProductIds = Array.from(new Set(lines.map((l) => l.productId)));
  const products = await Promise.all(uniqueProductIds.map((id) => productRepo.findById(id)));
  const productMap = new Map<string, Product>();
  products.forEach((p) => p && productMap.set(p.id, p));

  const items: BuiltItem[] = [];
  const codLines: CodCartLine[] = [];
  let subtotal = 0;

  for (const line of lines) {
    const product = productMap.get(line.productId);
    if (!product) throw new OrderBuildError("product_missing", `Product ${line.productId} not found`);
    const variant = product.variants.find((v) => v.id === line.variantId);
    if (!variant) throw new OrderBuildError("variant_missing", `Variant ${line.variantId} not found`);
    // A "Default" colour means the product has no variants on the storefront —
    // drop it from customer-visible error strings so they don't see the sentinel.
    const variantSuffix = variant.color === "Default" ? "" : ` — ${variant.color}`;
    const variantParens = variant.color === "Default" ? "" : ` (${variant.color})`;
    if (variant.stock <= 0)
      throw new OrderBuildError("out_of_stock", `${product.name}${variantSuffix} is sold out`);
    if (variant.stock < line.quantity) {
      throw new OrderBuildError(
        "insufficient_stock",
        `Only ${variant.stock} ${product.name}${variantParens} available`
      );
    }
    if (line.quantity > 30) {
      throw new OrderBuildError(
        "insufficient_stock",
        `Maximum allowed purchase quantity is 30 for ${product.name}${variantParens}`
      );
    }

    // Size validation: when the product has admin-configured enabled sizes, the
    // customer MUST pick one that is still enabled at order time. Disabled sizes
    // (e.g. a size the admin pulled between add-to-cart and checkout) are rejected.
    // Products without sizes just ignore any size value sent.
    const enabledSizes = (product.sizes ?? []).filter((s) => s.enabled && s.label.trim().length > 0);
    const submittedSize = line.size?.trim();
    let sizeSnapshot: string | undefined;
    if (enabledSizes.length > 0) {
      if (!submittedSize) {
        throw new OrderBuildError(
          "size_required",
          `Please select a size for ${product.name}${variantParens}`
        );
      }
      const match = enabledSizes.find(
        (s) => s.label.toLowerCase() === submittedSize.toLowerCase()
      );
      if (!match) {
        throw new OrderBuildError(
          "invalid_size",
          `Size "${submittedSize}" is not available for ${product.name}${variantParens}`
        );
      }
      sizeSnapshot = match.label;
    }

    const unit = priceOf(product, variant);
    const linePaise = unit * line.quantity;
    subtotal += linePaise;
    codLines.push({
      productId: product.id,
      categoryId: product.categoryId,
      linePaise
    });
    items.push({
      id: newId("oi"),
      productId: product.id,
      variantId: variant.id,
      productNameSnapshot: product.name,
      // Snapshot an empty label for Default-only products so order summaries,
      // invoices, and mail templates don't leak the sentinel to customers.
      variantLabelSnapshot: variant.color === "Default" ? "" : variant.color,
      sizeSnapshot,
      imageSnapshot: product.images[0]?.url ?? "",
      unitPricePaise: unit,
      quantity: line.quantity
    });
  }

  // Rate: state-based (admin-configured), server-authoritative.
  const [charges, defaults] = await Promise.all([
    shippingChargesRepo.list(),
    shippingChargesRepo.getDefaults()
  ]);
  const shipping = computeShipping({
    state: opts.state ?? null,
    subtotalPaise: subtotal,
    charges,
    defaults
  });
  // Zone is kept on the order purely as a logistics hint (ETA grouping).
  const eta = shippingEta({ pincode: opts.pincode });
  return {
    items,
    codLines,
    subtotalPaise: subtotal,
    shippingPaise: shipping.shippingPaise,
    shippingZone: eta.zone,
    totalPaise: subtotal + shipping.shippingPaise
  };
}
