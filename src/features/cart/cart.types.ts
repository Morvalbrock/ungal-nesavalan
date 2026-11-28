export interface CartItem {
  productId: string;
  variantId: string;
  /** Admin-configured size the shopper picked (e.g. "M"). Absent when the product has no sizes. */
  size?: string;
  /**
   * Composite identity for a cart line — same colour-variant with different sizes
   * must remain separate rows. Always `${variantId}` for sizeless products or
   * `${variantId}::${size}` when a size was selected. The store keys off this.
   */
  lineKey: string;
  slug: string;
  name: string;
  variantLabel: string;
  image: string;
  unitPricePaise: number;
  quantity: number;
  maxStock: number;
}

export function makeCartLineKey(variantId: string, size?: string): string {
  const trimmed = size?.trim();
  return trimmed ? `${variantId}::${trimmed}` : variantId;
}
