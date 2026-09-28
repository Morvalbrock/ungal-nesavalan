import { NextResponse } from "next/server";

// Diagnostic-only. Reveals whether required env vars are visible to the
// runtime — never leaks values. Safe to leave enabled for a demo; delete
// before real launch.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mask(v: string | undefined): string {
  if (!v) return "MISSING";
  const len = v.length;
  if (len < 8) return `SET(${len} chars)`;
  return `SET(${len} chars, ${v.slice(0, 4)}…${v.slice(-4)})`;
}

export async function GET() {
  return NextResponse.json({
    node: process.version,
    vercel_env: process.env.VERCEL_ENV ?? "not-vercel",
    vercel_region: process.env.VERCEL_REGION ?? "n/a",
    DATABASE_URL: mask(process.env.DATABASE_URL),
    DATABASE_URL_UNPOOLED: mask(process.env.DATABASE_URL_UNPOOLED),
    NEXT_PUBLIC_SITE_URL: mask(process.env.NEXT_PUBLIC_SITE_URL),
    CLOUDINARY_URL: mask(process.env.CLOUDINARY_URL),
    AUTH_SECRET: mask(process.env.AUTH_SECRET),
    RESEND_API_KEY: mask(process.env.RESEND_API_KEY)
  });
}
