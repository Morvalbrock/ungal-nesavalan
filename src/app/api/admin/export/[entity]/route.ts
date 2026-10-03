import { NextResponse } from "next/server";
import { requireAdmin } from "@/features/admin/guard";
import { readCollection } from "@/server/db/json-store";
import { orderRepo, userRepo } from "@/server/repositories";
import type { Product } from "@/types/product";
import { toCsv, csvFilename } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Entity = "products" | "orders" | "customers";

const VALID: Set<Entity> = new Set(["products", "orders", "customers"]);

export async function GET(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { entity } = await params;
  if (!VALID.has(entity as Entity)) {
    return NextResponse.json({ error: "invalid_entity" }, { status: 400 });
  }

  const url = new URL(req.url);
  const sp = Object.fromEntries(url.searchParams.entries());

  let csv: string;
  let filename: string;

  if (entity === "products") {
    csv = await buildProductsCsv(sp);
    filename = csvFilename("products");
  } else if (entity === "orders") {
    csv = await buildOrdersCsv(sp);
    filename = csvFilename("orders");
  } else {
    csv = await buildCustomersCsv(sp);
    filename = csvFilename("customers");
  }

  // Prepend BOM so Excel detects UTF-8 and renders Indian currency, Tamil names correctly.
  return new NextResponse("﻿" + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store"
    }
  });
}

// ---------------- Builders — mirror the filter logic in each admin page ------

async function buildProductsCsv(sp: Record<string, string>): Promise<string> {
  const products = await readCollection<Product>("products");
  const needle = sp.q?.trim().toLowerCase() ?? "";
  const filtered = products.filter((p) => {
    if (needle) {
      const hay = `${p.name} ${p.description} ${p.weave} ${p.fabric}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    if (sp.category && sp.category !== "all" && p.categoryId !== sp.category) return false;
    if (sp.status === "live" && !p.published) return false;
    if (sp.status === "draft" && p.published) return false;
    if (sp.featured === "yes" && !p.featured) return false;
    if (sp.featured === "no" && p.featured) return false;
    return true;
  });

  const header = [
    "ID",
    "Name",
    "Slug",
    "Category ID",
    "Fabric",
    "Weave",
    "Base price (INR)",
    "Sale price (INR)",
    "Stock",
    "Published",
    "Featured",
    "Created",
    "Updated"
  ];
  const rows = filtered.map((p) => [
    p.id,
    p.name,
    p.slug,
    p.categoryId,
    p.fabric,
    p.weave,
    (p.basePrice / 100).toFixed(2),
    p.salePrice != null ? (p.salePrice / 100).toFixed(2) : "",
    p.variants.reduce((n, v) => n + v.stock, 0),
    p.published ? "yes" : "no",
    p.featured ? "yes" : "no",
    p.createdAt,
    p.updatedAt
  ]);
  return toCsv(header, rows);
}

async function buildOrdersCsv(sp: Record<string, string>): Promise<string> {
  const [orders, users] = await Promise.all([orderRepo.listAll(), userRepo.list()]);
  const userMap = new Map(users.map((u) => [u.id, u]));
  const needle = sp.q?.trim().toLowerCase() ?? "";
  const filtered = orders.filter((o) => {
    if (sp.status && o.status !== sp.status) return false;
    if (needle) {
      const u = userMap.get(o.userId);
      const hay = `${o.orderNumber} ${u?.name ?? ""} ${u?.email ?? ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });

  const header = [
    "Order number",
    "Order ID",
    "Status",
    "Customer name",
    "Customer email",
    "Items",
    "Total (INR)",
    "Created"
  ];
  const rows = filtered.map((o) => {
    const u = userMap.get(o.userId);
    return [
      o.orderNumber,
      o.id,
      o.status,
      u?.name ?? "",
      u?.email ?? "",
      o.items.length,
      (o.totalPaise / 100).toFixed(2),
      o.createdAt
    ];
  });
  return toCsv(header, rows);
}

async function buildCustomersCsv(sp: Record<string, string>): Promise<string> {
  const [users, orders] = await Promise.all([userRepo.list(), orderRepo.listAll()]);
  const paidStatuses = new Set(["paid", "packed", "shipped", "delivered"]);
  const spendByUser = new Map<string, { count: number; total: number }>();
  for (const o of orders) {
    if (!paidStatuses.has(o.status)) continue;
    const prev = spendByUser.get(o.userId) ?? { count: 0, total: 0 };
    spendByUser.set(o.userId, { count: prev.count + 1, total: prev.total + o.totalPaise });
  }

  const needle = sp.q?.trim().toLowerCase() ?? "";
  const filtered = users.filter((u) => {
    if (needle) {
      const hay = `${u.name} ${u.email} ${u.phone ?? ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    if (sp.role && sp.role !== "all" && u.role !== sp.role) return false;
    return true;
  });

  const header = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Role",
    "Orders",
    "Lifetime spend (INR)",
    "Joined"
  ];
  const rows = filtered.map((u) => {
    const s = spendByUser.get(u.id);
    return [
      u.id,
      u.name,
      u.email,
      u.phone ?? "",
      u.role,
      s?.count ?? 0,
      s ? (s.total / 100).toFixed(2) : "0.00",
      u.createdAt
    ];
  });
  return toCsv(header, rows);
}
