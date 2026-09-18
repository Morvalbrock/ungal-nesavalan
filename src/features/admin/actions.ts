"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "./guard";
import {
  categoryRepo,
  orderRepo,
  productRepo
} from "@/server/repositories";
import type { OrderStatus } from "@/types/order";
import type { Fabric, Occasion, Product, ProductImage, Variant, Weave } from "@/types/product";
import { FABRICS, OCCASIONS, WEAVES } from "@/features/products/filters";
import { newId } from "@/server/db/json-store";
import { slugify } from "@/lib/utils";

const productSchema = z.object({
  id: z.string().optional(),
  slug: z.string().trim().optional(),
  name: z.string().trim().min(2),
  description: z.string().trim().min(1),
  basePrice: z.coerce.number().int().min(0),
  salePrice: z
    .union([z.coerce.number().int().min(0), z.literal("").transform(() => undefined)])
    .optional(),
  fabric: z.enum(FABRICS as unknown as [Fabric, ...Fabric[]]),
  weave: z.enum(WEAVES as unknown as [Weave, ...Weave[]]),
  occasion: z.array(z.enum(OCCASIONS as unknown as [Occasion, ...Occasion[]])).min(1),
  region: z.string().trim().min(1),
  lengthMeters: z.coerce.number().min(0),
  blousePieceIncluded: z.boolean().default(false),
  careInstructions: z.string().trim().min(1),
  categoryId: z.string().min(1),
  images: z
    .array(
      z.object({
        id: z.string().optional(),
        url: z.string().url("Enter a valid image URL"),
        alt: z.string().trim().default(""),
        sort: z.coerce.number().default(0)
      })
    )
    .min(1, "Add at least one image"),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        color: z.string().trim().min(1),
        colorHex: z.string().trim().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Hex like #a1b2c3"),
        sku: z.string().trim().min(1),
        stock: z.coerce.number().int().min(0),
        priceOverride: z
          .union([z.coerce.number().int().min(0), z.literal("").transform(() => undefined)])
          .optional()
      })
    )
    .min(1, "Add at least one variant"),
  featured: z.boolean().default(false),
  published: z.boolean().default(true)
});

export type ProductFormValues = z.input<typeof productSchema>;

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; issues?: Record<string, string[]> };

export async function upsertProduct(values: ProductFormValues): Promise<ActionResult<{ slug: string }>> {
  await requireAdmin();
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_input",
      issues: parsed.error.flatten().fieldErrors as Record<string, string[]>
    };
  }
  const data = parsed.data;
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);

  const productId = data.id ?? newId("prd");
  const images: ProductImage[] = data.images.map((img, i) => ({
    id: img.id ?? newId("img"),
    url: img.url,
    alt: img.alt || data.name,
    sort: img.sort ?? i
  }));
  const variants: Variant[] = data.variants.map((v) => ({
    id: v.id ?? newId("var"),
    productId,
    color: v.color,
    colorHex: v.colorHex.toLowerCase(),
    sku: v.sku,
    stock: v.stock,
    priceOverride: v.priceOverride,
    images: []
  }));

  const payload: Omit<Product, "createdAt" | "updatedAt"> = {
    id: productId,
    slug,
    name: data.name,
    description: data.description,
    basePrice: data.basePrice,
    salePrice: data.salePrice,
    fabric: data.fabric,
    weave: data.weave,
    occasion: data.occasion,
    region: data.region,
    lengthMeters: data.lengthMeters,
    blousePieceIncluded: data.blousePieceIncluded,
    careInstructions: data.careInstructions,
    categoryId: data.categoryId,
    images,
    variants,
    featured: data.featured,
    published: data.published
  };

  if (data.id) {
    const updated = await productRepo.update(data.id, payload);
    if (!updated) return { ok: false, error: "not_found" };
  } else {
    await productRepo.create(payload);
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  return { ok: true, data: { slug } };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  const removed = await productRepo.remove(id);
  if (!removed) return { ok: false, error: "not_found" };
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true };
}

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  image: z.union([z.string().url(), z.literal("")]).optional(),
  sort: z.coerce.number().default(0)
});

export async function upsertCategory(values: z.input<typeof categorySchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_input",
      issues: parsed.error.flatten().fieldErrors as Record<string, string[]>
    };
  }
  const d = parsed.data;
  const slug = d.slug?.trim() ? slugify(d.slug) : slugify(d.name);
  const payload = {
    slug,
    name: d.name,
    description: d.description || undefined,
    image: d.image || undefined,
    sort: d.sort
  };
  if (d.id) {
    const updated = await categoryRepo.update(d.id, payload);
    if (!updated) return { ok: false, error: "not_found" };
  } else {
    await categoryRepo.create(payload);
  }
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  const removed = await categoryRepo.remove(id);
  if (!removed) return { ok: false, error: "not_found" };
  revalidatePath("/admin/categories");
  return { ok: true };
}

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded"
];

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<ActionResult> {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) return { ok: false, error: "invalid_status" };
  const updated = await orderRepo.updateStatus(orderId, status);
  if (!updated) return { ok: false, error: "not_found" };
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/orders");
  return { ok: true };
}
