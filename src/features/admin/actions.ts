"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, requireSuperAdmin } from "./guard";
import {
  categoryRepo,
  couponRepo,
  heroSlideRepo,
  orderRepo,
  paymentRepo,
  postRepo,
  productRepo,
  questionRepo,
  returnRepo,
  userRepo,
  announcementRepo,
  pageBannerRepo
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
          .optional(),
        imageUrl: z
          .union([
            z.string().trim().refine((v) => /^https?:\/\//.test(v) || v.startsWith("/"), {
              message: "Upload or paste a valid image URL"
            }),
            z.literal("").transform(() => undefined)
          ])
          .optional(),
        imageAlt: z.string().trim().optional()
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
    images: v.imageUrl
      ? [{ id: newId("img"), url: v.imageUrl, alt: v.imageAlt || v.color || data.name, sort: 0 }]
      : []
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
  await requireSuperAdmin();
  const removed = await productRepo.remove(id);
  if (!removed) return { ok: false, error: "not_found" };
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true };
}

export async function toggleProductPublished(id: string, published: boolean): Promise<ActionResult> {
  await requireAdmin();
  const updated = await productRepo.update(id, { published });
  if (!updated) return { ok: false, error: "not_found" };
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${updated.slug}`);
  return { ok: true };
}

export async function toggleProductFeatured(id: string, featured: boolean): Promise<ActionResult> {
  await requireAdmin();
  const updated = await productRepo.update(id, { featured });
  if (!updated) return { ok: false, error: "not_found" };
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products");
  return { ok: true };
}

// Role management is ALWAYS super_admin only. Guards: can't change your own role,
// can't demote the last super_admin, can't demote the last admin.
export async function setUserRole(
  userId: string,
  role: "customer" | "admin" | "super_admin"
): Promise<ActionResult> {
  const session = await requireSuperAdmin();
  if (userId === session.userId) {
    return { ok: false, error: "cannot_change_own_role" };
  }
  const users = await userRepo.list();
  const target = users.find((u) => u.id === userId);
  if (!target) return { ok: false, error: "not_found" };

  // Protect against locking out the admin surface
  if (target.role === "super_admin" && role !== "super_admin") {
    const supers = users.filter((u) => u.role === "super_admin");
    if (supers.length <= 1) {
      return { ok: false, error: "cannot_demote_last_super_admin" };
    }
  }
  if (target.role === "admin" && role === "customer") {
    const admins = users.filter((u) => u.role === "admin" || u.role === "super_admin");
    if (admins.length <= 1) {
      return { ok: false, error: "cannot_demote_last_admin" };
    }
  }

  const updated = await userRepo.update(userId, { role });
  if (!updated) return { ok: false, error: "not_found" };
  revalidatePath("/admin/customers");
  return { ok: true };
}

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  image: z.string().optional(),
  headerImage: z.string().optional(),
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
    headerImage: d.headerImage || undefined,
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
  revalidatePath("/products");
  revalidatePath(`/category/${slug}`);
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireSuperAdmin();
  const removed = await categoryRepo.remove(id);
  if (!removed) return { ok: false, error: "not_found" };
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/products");
  return { ok: true };
}

const pageBannerSchema = z.object({
  id: z.string().trim().min(1),
  page: z.string().trim().min(1),
  title: z.string().trim().min(1),
  subtitle: z.string().trim().optional(),
  imageUrl: z.string().optional()
});

export async function upsertPageBanner(values: z.input<typeof pageBannerSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = pageBannerSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_input",
      issues: parsed.error.flatten().fieldErrors as Record<string, string[]>
    };
  }
  const d = parsed.data;
  await pageBannerRepo.upsert({
    id: d.id,
    page: d.page,
    title: d.title,
    subtitle: d.subtitle || undefined,
    imageUrl: d.imageUrl || undefined
  });
  revalidatePath("/admin/categories");
  revalidatePath(d.page);
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

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  shipping?: { trackingId?: string; courier?: string }
): Promise<ActionResult> {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) return { ok: false, error: "invalid_status" };

  let updated = await orderRepo.updateStatus(orderId, status);
  if (!updated) return { ok: false, error: "not_found" };

  if (shipping) {
    const withShipping = await orderRepo.updateShipping(orderId, shipping);
    if (withShipping) updated = withShipping;
  }

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
  const { subject, html } =
    status === "shipped"
      ? shippedEmail(order, { trackingId: order.trackingId, courier: order.courier })
      : deliveredEmail(order);
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

export async function deleteCoupon(id: string): Promise<ActionResult> {
  await requireSuperAdmin();
  const removed = await couponRepo.remove(id);
  if (!removed) return { ok: false, error: "not_found" };
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function deleteQuestion(id: string): Promise<ActionResult> {
  await requireAdmin();
  const removed = await questionRepo.remove(id);
  if (!removed) return { ok: false, error: "not_found" };
  revalidatePath("/admin/questions");
  return { ok: true };
}

// --- Bulk actions ------------------------------------------------------------

export async function bulkDeleteProducts(ids: string[]): Promise<ActionResult<{ deleted: number }>> {
  await requireSuperAdmin();
  if (ids.length === 0) return { ok: true, data: { deleted: 0 } };
  let deleted = 0;
  for (const id of ids) {
    if (await productRepo.remove(id)) deleted++;
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true, data: { deleted } };
}

export async function bulkSetProductPublished(
  ids: string[],
  published: boolean
): Promise<ActionResult<{ updated: number }>> {
  await requireAdmin();
  if (ids.length === 0) return { ok: true, data: { updated: 0 } };
  let updated = 0;
  for (const id of ids) {
    const res = await productRepo.update(id, { published });
    if (res) updated++;
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true, data: { updated } };
}

export async function bulkSetProductFeatured(
  ids: string[],
  featured: boolean
): Promise<ActionResult<{ updated: number }>> {
  await requireAdmin();
  if (ids.length === 0) return { ok: true, data: { updated: 0 } };
  let updated = 0;
  for (const id of ids) {
    const res = await productRepo.update(id, { featured });
    if (res) updated++;
  }
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true, data: { updated } };
}

export async function markCodCollected(orderId: string): Promise<ActionResult> {
  await requireAdmin();
  const order = await orderRepo.findById(orderId);
  if (!order) return { ok: false, error: "not_found" };
  if (order.paymentMode !== "cod") return { ok: false, error: "not_a_cod_order" };
  if ((order.amountDuePaise ?? 0) <= 0) return { ok: false, error: "nothing_due" };
  const updated = await orderRepo.markCodCollected(orderId);
  if (!updated) return { ok: false, error: "not_found" };
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/account/orders/${orderId}`);
  return { ok: true };
}

export async function bulkUpdateOrderStatus(
  orderIds: string[],
  status: OrderStatus
): Promise<ActionResult<{ updated: number }>> {
  await requireAdmin();
  if (orderIds.length === 0) return { ok: true, data: { updated: 0 } };
  let updated = 0;
  for (const id of orderIds) {
    const res = await updateOrderStatus(id, status);
    if (res.ok) updated++;
  }
  return { ok: true, data: { updated } };
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
          const refundablePaise =
            order.paymentMode === "cod"
              ? Math.min(order.amountPaidPaise ?? 0, payment.amountPaise)
              : order.totalPaise;
          if (refundablePaise > 0) {
            const refund = await provider.refund({
              providerPaymentId: payment.providerPaymentId,
              amountPaise: refundablePaise,
              notes: { orderId: order.id, returnId: ret.id }
            });
            refundId = refund.refundId;
          }
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

const announcementSchema = z.object({
  id: z.string().optional(),
  text: z.string().trim().min(1, "Text is required"),
  link: z.string().trim().default(""),
  sort: z.coerce.number().int().default(0),
  active: z.boolean().default(true)
});

export type AnnouncementFormValues = z.input<typeof announcementSchema>;

export async function upsertAnnouncement(values: AnnouncementFormValues): Promise<ActionResult> {
  await requireAdmin();
  const parsed = announcementSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_input",
      issues: parsed.error.flatten().fieldErrors as Record<string, string[]>
    };
  }
  const { id, ...payload } = parsed.data;
  if (id) {
    const updated = await announcementRepo.update(id, payload);
    if (!updated) return { ok: false, error: "not_found" };
  } else {
    await announcementRepo.create(payload);
  }
  revalidatePath("/admin/announcements");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  await requireAdmin();
  const removed = await announcementRepo.remove(id);
  if (!removed) return { ok: false, error: "not_found" };
  revalidatePath("/admin/announcements");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function toggleAnnouncementActive(id: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  const updated = await announcementRepo.update(id, { active });
  if (!updated) return { ok: false, error: "not_found" };
  revalidatePath("/admin/announcements");
  revalidatePath("/", "layout");
  return { ok: true };
}

const journalPostSchema = z.object({
  id: z.string().optional(),
  slug: z.string().trim().optional(),
  title: z.string().trim().min(2, "Title is required"),
  excerpt: z.string().trim().min(1, "Excerpt is required"),
  heroImage: z
    .union([
      z.string().trim().refine((v) => /^https?:\/\//.test(v) || v.startsWith("/"), {
        message: "Upload or paste a valid image URL"
      }),
      z.literal("").transform(() => undefined)
    ])
    .optional(),
  publishedAt: z.string().trim().min(1, "Published date is required"),
  tags: z.array(z.string().trim().min(1)).default([]),
  relatedProductSlugs: z.array(z.string().trim().min(1)).default([]),
  draft: z.boolean().default(false),
  content: z.string().trim().min(1, "Article body is required")
});

export type JournalPostFormValues = z.input<typeof journalPostSchema>;

export async function upsertJournalPost(
  values: JournalPostFormValues
): Promise<ActionResult<{ slug: string }>> {
  await requireAdmin();
  const parsed = journalPostSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_input",
      issues: parsed.error.flatten().fieldErrors as Record<string, string[]>
    };
  }
  const d = parsed.data;
  const slug = d.slug?.trim() ? slugify(d.slug) : slugify(d.title);

  const payload = {
    slug,
    title: d.title,
    excerpt: d.excerpt,
    heroImage: d.heroImage,
    publishedAt: d.publishedAt,
    tags: d.tags,
    relatedProductSlugs: d.relatedProductSlugs,
    draft: d.draft,
    content: d.content
  };

  if (d.id) {
    const updated = await postRepo.update(d.id, payload);
    if (!updated) return { ok: false, error: "not_found" };
  } else {
    await postRepo.create(payload);
  }

  revalidatePath("/admin/journal");
  revalidatePath("/journal");
  revalidatePath(`/journal/${slug}`);
  return { ok: true, data: { slug } };
}

export async function deleteJournalPost(id: string): Promise<ActionResult> {
  await requireSuperAdmin();
  const removed = await postRepo.remove(id);
  if (!removed) return { ok: false, error: "not_found" };
  revalidatePath("/admin/journal");
  revalidatePath("/journal");
  return { ok: true };
}
