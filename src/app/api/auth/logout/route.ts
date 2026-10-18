import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/features/auth/session";

export async function POST(req: NextRequest) {
  await clearSessionCookie();

  const acceptsHtml = req.headers.get("accept")?.includes("text/html");
  const isForm = req.headers.get("content-type")?.includes("application/x-www-form-urlencoded");

  // Redirect to homepage if submitted from browser form or directly visited
  if (acceptsHtml || isForm) {
    const next = req.nextUrl.searchParams.get("next") || "/";
    return NextResponse.redirect(new URL(next, req.url), 303);
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  await clearSessionCookie();
  const next = req.nextUrl.searchParams.get("next") || "/";
  return NextResponse.redirect(new URL(next, req.url), 303);
}
