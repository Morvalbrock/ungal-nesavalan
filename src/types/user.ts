export type UserRole = "customer" | "admin" | "super_admin";

export const ADMIN_ROLES: UserRole[] = ["admin", "super_admin"];

export function isAdminRole(role: UserRole | string | undefined | null): boolean {
  return role === "admin" || role === "super_admin";
}

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  name: string;
  phone?: string;
  role: UserRole;
  googleId?: string;
  image?: string;
  createdAt: string;
}

export type PublicUser = Omit<User, "passwordHash">;
