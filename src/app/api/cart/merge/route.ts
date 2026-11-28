import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/session";
import { cartRepo, productRepo } from "@/server/repositories";
import type { CartItem } from "@/features/cart/cart.types";
import { makeCartLineKey } from "@/features/cart/cart.types";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { items?: CartItem[] } | null;
  const incoming = Array.isArray(body?.items) ? body!.items : [];

  const existing = (await cartRepo.get(session.userId))?.items ?? [];
  const merged = new Map<string, CartItem>();
  for (const item of existing) merged.set(keyOf(item), { ...item });

  for (const item of incoming) {
    const key = keyOf(item);
    const current = merged.get(key);
    if (current) {
      current.quantity = current.quantity + item.quantity;
    } else {
      merged.set(key, { ...item });
    }
  }

  // Re-validate every merged line against live product data (name, price, stock, image).
  // Also drop any size that the admin has since disabled or removed — stale sizes
  // would be rejected downstream by create-order anyway.
  const cleaned: CartItem[] = [];
  for (const line of merged.values()) {
    const product = await productRepo.findById(line.productId);
    if (!product) continue;
    const variant = product.variants.find((v) => v.id === line.variantId);
    if (!variant || variant.stock <= 0) continue;
    const unit = variant.priceOverride ?? product.salePrice ?? product.basePrice;
    const enabledSizes = (product.sizes ?? []).filter((s) => s.enabled && s.label.trim().length > 0);
    let size: string | undefined = line.size?.trim() || undefined;
    if (size) {
      const match = enabledSizes.find((s) => s.label.toLowerCase() === size!.toLowerCase());
      // Line arrived with a size — keep it only if still available. If dropped and the
      // product still requires a size, downstream checkout will prompt the user.
      size = match?.label;
    }
    cleaned.push({
      productId: product.id,
      variantId: variant.id,
      size,
      lineKey: makeCartLineKey(variant.id, size),
      slug: product.slug,
      name: product.name,
      variantLabel: variant.color === "Default" ? "" : variant.color,
      image: product.images[0]?.url ?? "",
      unitPricePaise: unit,
      quantity: Math.min(line.quantity, Math.min(30, variant.stock)),
      maxStock: Math.min(30, variant.stock)
    });
  }

  const saved = await cartRepo.save(session.userId, cleaned);
  return NextResponse.json({ items: saved.items });
}

function keyOf(item: Pick<CartItem, "productId" | "variantId" | "size">) {
  // Same colour + different size must stay separate rows, matching the client store's
  // dedup rule — otherwise merging would silently collapse them into one line.
  const sizeSuffix = item.size?.trim() ? `::${item.size.trim()}` : "";
  return `${item.productId}::${item.variantId}${sizeSuffix}`;
}
