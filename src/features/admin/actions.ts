"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "./guard";
import {
  categoryRepo,
  couponRepo,
  heroSlideRepo,
  orderRepo,
  paymentRepo,
  productRepo,
  returnRepo,
  userRepo
} from "@/server/repositories";
import { getPaymentProvider } from "@/features/payments";
import { getMailProvider } from "@/features/mail";
import { deliveredEmail, returnDecisionEmail, shippedEmail } from "@/features/mail/templates";
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
  "return_requested",
  "cancelled",
  "refunded"
];

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<ActionResult> {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) return { ok: false, error: "invalid_status" };
  const updated = await orderRepo.updateStatus(orderId, status);
  if (!updated) return { ok: false, error: "not_found" };

  if (status === "shipped" || status === "delivered") {
    void sendStatusEmail(updated, status).catch((err) =>
      console.error("[status] email failed:", (err as Error).message)
    );
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/orders");
  return { ok: true };
}

async function sendStatusEmail(order: Awaited<ReturnType<typeof orderRepo.findById>>, status: "shipped" | "delivered") {
  if (!order) return;
  const user = await userRepo.findById(order.userId);
  if (!user) return;
  const { subject, html } = status === "shipped" ? shippedEmail(order) : deliveredEmail(order);
  await getMailProvider().send({
    to: user.email,
    subject,
    html,
    tags: { orderId: order.id, orderNumber: order.orderNumber, event: status }
  });
}

const couponSchema = z.object({
  id: z.string().optional(),
  code: z.string().trim().min(2).max(64),
  kind: z.enum(["percent", "fixed"]),
  value: z.coerce.number().min(1),
  minSubtotalPaise: z.coerce.number().int().min(0).default(0),
  maxRedemptions: z
    .union([z.coerce.number().int().min(1), z.literal("").transform(() => null)])
    .nullable()
    .optional(),
  perUserLimit: z.coerce.number().int().min(0).default(1),
  expiresAt: z
    .union([z.string().trim().min(1), z.literal("").transform(() => null)])
    .nullable()
    .optional(),
  active: z.boolean().default(true)
});

export type CouponFormValues = z.input<typeof couponSchema>;

export async function upsertCoupon(values: CouponFormValues): Promise<ActionResult> {
  await requireAdmin();
  const parsed = couponSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_input",
      issues: parsed.error.flatten().fieldErrors as Record<string, string[]>
    };
  }
  const d = parsed.data;
  if (d.kind === "percent" && d.value > 100) {
    return { ok: false, error: "invalid_input", issues: { value: ["Percent must be ≤ 100"] } };
  }

  const payload = {
    code: d.code,
    kind: d.kind,
    value: d.value,
    minSubtotalPaise: d.minSubtotalPaise,
    maxRedemptions: d.maxRedemptions ?? null,
    perUserLimit: d.perUserLimit,
    expiresAt: d.expiresAt ? new Date(d.expiresAt).toISOString() : null,
    active: d.active
  };

  try {
    if (d.id) {
      const updated = await couponRepo.update(d.id, payload);
      if (!updated) return { ok: false, error: "not_found" };
    } else {
      await couponRepo.create(payload);
    }
  } catch (err) {
    if ((err as Error).message === "duplicate_code") {
      return { ok: false, error: "invalid_input", issues: { code: ["That code already exists"] } };
    }
    throw err;
  }
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function toggleCouponActive(id: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  const updated = await couponRepo.update(id, { active });
  if (!updated) return { ok: false, error: "not_found" };
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function decideReturn(
  id: string,
  decision: "approved" | "rejected",
  adminNote: string
): Promise<ActionResult> {
  await requireAdmin();
  const ret = await returnRepo.findById(id);
  if (!ret) return { ok: false, error: "not_found" };
  if (ret.decision) return { ok: false, error: "already_decided" };

  const order = await orderRepo.findById(ret.orderId);
  if (!order) return { ok: false, error: "not_found" };

  let refundId: string | undefined;
  if (decision === "approved") {
    if (order.paymentId) {
      const payment = await paymentRepo.findById(order.paymentId);
      if (payment?.providerPaymentId) {
        try {
          const provider = getPaymentProvider();
          const refund = await provider.refund({
            providerPaymentId: payment.providerPaymentId,
            amountPaise: order.totalPaise,
            notes: { orderId: order.id, returnId: ret.id }
          });
          refundId = refund.refundId;
        } catch (err) {
          return { ok: false, error: `refund_failed:${(err as Error).message}` };
        }
      }
    }
    await orderRepo.updateStatus(ret.orderId, "refunded");
  } else {
    await orderRepo.updateStatus(ret.orderId, "delivered");
  }

  await returnRepo.decide(id, decision, adminNote, refundId);

  try {
    const user = await userRepo.findById(ret.userId);
    if (user) {
      const { subject, html } = returnDecisionEmail({
        customerName: user.name,
        orderNumber: order.orderNumber,
        decision,
        note: adminNote,
        refundId
      });
      await getMailProvider().send({
        to: user.email,
        subject,
        html,
        tags: { orderId: order.id, returnId: id, decision }
      });
    }
  } catch (err) {
    console.error("[return] decision email failed:", (err as Error).message);
  }

  revalidatePath("/admin/returns");
  revalidatePath(`/admin/orders/${ret.orderId}`);
  revalidatePath(`/account/orders/${ret.orderId}`);
  return { ok: true };
}

const imageRef = z
  .string()
  .trim()
  .refine((v) => /^https?:\/\//.test(v) || v.startsWith("/"), {
    message: "Upload an image or paste a full URL"
  });

const heroSlideSchema = z.object({
  id: z.string().optional(),
  imageUrl: imageRef,
  imageAlt: z.string().trim().min(1, "Alt text is required"),
  eyebrow: z.string().trim().default(""),
  headline: z.string().trim().min(1, "Headline is required"),
  headlineItalic: z.string().trim().default(""),
  subheadline: z.string().trim().default(""),
  ctaPrimaryLabel: z.string().trim().default(""),
  ctaPrimaryHref: z.string().trim().default(""),
  ctaSecondaryLabel: z.string().trim().default(""),
  ctaSecondaryHref: z.string().trim().default(""),
  featureImageUrl: z.union([imageRef, z.literal("")]).default(""),
  featureImageAlt: z.string().trim().default(""),
  featureEyebrow: z.string().trim().default(""),
  featureTitle: z.string().trim().default(""),
  featureSubtitle: z.string().trim().default(""),
  sort: z.coerce.number().int().default(0),
  active: z.boolean().default(true)
});

export type HeroSlideFormValues = z.input<typeof heroSlideSchema>;

export async function upsertHeroSlide(values: HeroSlideFormValues): Promise<ActionResult> {
  await requireAdmin();
  const parsed = heroSlideSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_input",
      issues: parsed.error.flatten().fieldErrors as Record<string, string[]>
    };
  }
  const { id, ...payload } = parsed.data;
  if (id) {
    const updated = await heroSlideRepo.update(id, payload);
    if (!updated) return { ok: false, error: "not_found" };
  } else {
    await heroSlideRepo.create(payload);
  }
  revalidatePath("/admin/hero-slides");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteHeroSlide(id: string): Promise<ActionResult> {
  await requireAdmin();
  const removed = await heroSlideRepo.remove(id);
  if (!removed) return { ok: false, error: "not_found" };
  revalidatePath("/admin/hero-slides");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleHeroSlideActive(id: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  const updated = await heroSlideRepo.update(id, { active });
  if (!updated) return { ok: false, error: "not_found" };
  revalidatePath("/admin/hero-slides");
  revalidatePath("/");
  return { ok: true };
}
