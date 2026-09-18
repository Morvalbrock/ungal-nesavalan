import { cookies } from "next/headers";
import { jwtAuthProvider } from "./jwt-auth.provider";
import type { SessionPayload } from "./auth.provider";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30;

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return jwtAuthProvider.verifyToken(token);
}
