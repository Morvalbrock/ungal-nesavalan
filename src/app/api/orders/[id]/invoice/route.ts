import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
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

  const buffer = await renderToBuffer(
    InvoiceDocument({
      order,
      brand: {
        name: "Ungal Nesavalan",
        tagline: "Handloom sarees, loomed by hand.",
        supportEmail: process.env.SUPPORT_EMAIL ?? "care@ungalnesavalan.example"
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
