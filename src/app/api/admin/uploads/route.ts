import crypto from "node:crypto";
import path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/session";

// Local dev image stub. Writes to /public/products/ so paths like `/products/<file>` resolve.
// Swap to Cloudinary/S3 in Phase 9 without touching ProductForm.
export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"]
]);

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }

  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 413 });
  }

  const dir = path.join(process.cwd(), "public", "products");
  await mkdir(dir, { recursive: true });

  const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), bytes);

  return NextResponse.json({ url: `/products/${name}` });
}
