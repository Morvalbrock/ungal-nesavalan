import "server-only";
import { getSession } from "@/features/auth/session";
import type { SessionPayload } from "@/features/auth/auth.provider";
import { isAdminRole } from "@/types/user";

export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}

// Accepts admin OR super_admin.
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) throw new ForbiddenError();
  return session;
}

// Only super_admin — for destructive actions (delete anything, role management).
export async function requireSuperAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.role !== "super_admin") throw new ForbiddenError();
  return session;
}
