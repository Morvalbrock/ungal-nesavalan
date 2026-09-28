import crypto from "node:crypto";
import path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import { NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { getSession } from "@/features/auth/session";

// Admin image uploads.
// - With CLOUDINARY_URL set: pushes to Cloudinary and returns the secure_url.
// - Without: writes under /public (local dev only; won't persist on Vercel).
// The response shape ({ url }) is unchanged, so forms/consumers don't care.

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"]
]);

const FOLDERS = new Map<string, string>([
  ["products", "products"],
  ["hero", "images/hero"]
]);

const USE_CLOUDINARY = Boolean(process.env.CLOUDINARY_URL);

function uploadToCloudinary(bytes: Buffer, folder: string): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `ungal-nesavalan/${folder}`,
        resource_type: "image",
        overwrite: false,
        unique_filename: true
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("cloudinary_no_result"));
        resolve(result);
      }
    );
    stream.end(bytes);
  });
}

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

  const folderKey = (form.get("folder") ?? "products").toString();
  const folder = FOLDERS.get(folderKey);
  if (!folder) {
    return NextResponse.json({ error: "invalid_folder" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  if (USE_CLOUDINARY) {
    try {
      const result = await uploadToCloudinary(bytes, folderKey);
      return NextResponse.json({ url: result.secure_url });
    } catch (err) {
      console.error("cloudinary upload failed", err);
      return NextResponse.json({ error: "upload_failed" }, { status: 502 });
    }
  }

  // Local dev fallback: write under /public
  const dir = path.join(process.cwd(), "public", ...folder.split("/"));
  await mkdir(dir, { recursive: true });
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  await writeFile(path.join(dir, name), bytes);
  return NextResponse.json({ url: `/${folder}/${name}` });
}
