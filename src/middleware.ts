import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "session";

function getSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

async function verify(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    return payload as { userId?: string; role?: "customer" | "admin" | "super_admin" };
  } catch {
    return null;
  }
}

function isAdminish(role: string | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const needsUser = pathname.startsWith("/account");
  const needsAdmin = pathname.startsWith("/admin");
  if (!needsUser && !needsAdmin) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = await verify(token);

  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (needsAdmin && !isAdminish(payload.role)) {
    const url = req.nextUrl.clone();
    url.pathname = "/forbidden";
    url.search = "";
    return NextResponse.rewrite(url, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"]
};
