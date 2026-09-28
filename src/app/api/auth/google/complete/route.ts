import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { userRepo } from "@/server/repositories";
import { signForUser } from "@/features/auth/jwt-auth.provider";
import { setSessionCookie } from "@/features/auth/session";

function safeNext(raw: string | null): string {
  if (!raw) return "/account/profile";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/account/profile";
  return raw;
}

async function clearAuthJsCookies(): Promise<void> {
  const store = await cookies();
  for (const c of store.getAll()) {
    if (/^(?:__Secure-|__Host-)?authjs\./.test(c.name)) {
      store.set(c.name, "", { path: "/", maxAge: 0 });
    }
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = safeNext(url.searchParams.get("next"));

  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.redirect(new URL("/login?error=google_signin_failed", req.url));
  }

  const user = await userRepo.findByEmail(email);
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=google_signin_failed", req.url));
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
  await setSessionCookie(token);
  await clearAuthJsCookies();

  return NextResponse.redirect(new URL(next, req.url));
}
