import "server-only";
import { getSession } from "@/features/auth/session";
import type { SessionPayload } from "@/features/auth/auth.provider";

export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new ForbiddenError();
  return session;
}
