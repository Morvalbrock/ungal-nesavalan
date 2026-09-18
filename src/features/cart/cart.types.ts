export interface CartItem {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  variantLabel: string;
  image: string;
  unitPricePaise: number;
  quantity: number;
  maxStock: number;
}
