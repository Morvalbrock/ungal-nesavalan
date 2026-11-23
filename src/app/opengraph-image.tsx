import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const alt = "Ungal Nesavalan — Direct from Our Elampillai Looms";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const abs = path.join(process.cwd(), "public", "images", "og-share.png");
  const bytes = await fs.readFile(abs);
  return new Response(bytes, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
