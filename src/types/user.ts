export type UserRole = "customer" | "admin";

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
