import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import fs from "node:fs";
import path from "node:path";
import { getSession } from "@/features/auth/session";
import { orderRepo } from "@/server/repositories";
import { InvoiceDocument } from "@/features/invoices/InvoiceDocument";

export const runtime = "nodejs";

const DOWNLOADABLE = new Set(["paid", "packed", "shipped", "delivered", "return_requested", "refunded"]);

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const order = await orderRepo.findById(id);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const isOwner = order.userId === session.userId;
  const isAdmin = session.role === "admin" || session.role === "super_admin";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  if (!DOWNLOADABLE.has(order.status)) {
    return NextResponse.json({ error: "not_downloadable" }, { status: 409 });
  }

  // Read logo from public/images/logo.png (or fallback to logo.jpeg or invoice_logo.jpeg)
  let logoDataUrl: string | undefined;
  try {
    const logoPng = path.join(process.cwd(), "public", "images", "logo.png");
    const logoJpeg = path.join(process.cwd(), "public", "images", "logo.jpeg");
    const invoiceLogoPath = path.join(process.cwd(), "public", "images", "invoice_logo.jpeg");
    const logoPath = fs.existsSync(logoPng)
      ? logoPng
      : fs.existsSync(logoJpeg)
      ? logoJpeg
      : invoiceLogoPath;
    if (fs.existsSync(logoPath)) {
      const buffer = fs.readFileSync(logoPath);
      const mime = logoPath.endsWith(".png") ? "image/png" : "image/jpeg";
      logoDataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    }
  } catch (err) {
    console.warn("[invoice] Failed to load logo from disk:", (err as Error).message);
  }

  const buffer = await renderToBuffer(
    InvoiceDocument({
      order,
      brand: {
        name: "Ungal Nesavalan",
        tagline: "Direct from Our Elampillai Looms",
        supportEmail: process.env.SUPPORT_EMAIL ?? "ungalnesavalan01@gmail.com",
        logoDataUrl
      }
    })
  );

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="UN-${order.orderNumber}.pdf"`,
      "Cache-Control": "private, no-store"
    }
  });
}
