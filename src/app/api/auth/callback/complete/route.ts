import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { userRepo } from "@/server/repositories";
import { signForUser, SESSION_MAX_AGE_SEC } from "@/features/auth/jwt-auth.provider";
import { SESSION_COOKIE } from "@/features/auth/session";

function safeNext(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

function publicBase(req: Request): string {
  // Hostinger's reverse proxy forwards req.url as http://0.0.0.0:3000/...
  // Prefer AUTH_URL / NEXT_PUBLIC_SITE_URL so redirects target the real domain.
  return (
    process.env.AUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    req.url
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawNext = url.searchParams.get("next");
  const next = safeNext(rawNext);
  const base = publicBase(req);
  console.log("[oauth/complete] rawNext=%j resolved=%j base=%j", rawNext, next, base);

  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  console.log("[oauth/complete] auth() session email=%j", email ?? null);
  if (!email) {
    console.log("[oauth/complete] BAIL — auth() returned no session/email");
    return NextResponse.redirect(new URL("/login?error=google_signin_failed", base));
  }

  const user = await userRepo.findByEmail(email);
  console.log("[oauth/complete] userRepo.findByEmail(%s) → %s", email, user ? user.id : "NOT FOUND");
  if (!user) {
    console.log("[oauth/complete] BAIL — user not in DB (race with signIn callback create?)");
    return NextResponse.redirect(new URL("/login?error=google_signin_failed", base));
  }

  const token = await signForUser({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    googleId: user.googleId,
    image: user.image,
    createdAt: user.createdAt
  });

  const res = NextResponse.redirect(new URL(next, base));
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC
  });
  // Kill Auth.js's own session cookies — we've bridged into our JWT.
  const raw = req.headers.get("cookie") ?? "";
  for (const m of raw.matchAll(/(?:^|;\s*)((?:__Secure-|__Host-)?authjs\.[^=]+)=/g)) {
    res.cookies.set(m[1], "", { path: "/", maxAge: 0 });
  }
  return res;
}
