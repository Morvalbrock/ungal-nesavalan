import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { userRepo } from "@/server/repositories";
import type { PublicUser } from "@/types/user";
import {
  AuthError,
  type AuthProvider,
  type LoginInput,
  type RegisterInput,
  type SessionPayload
} from "./auth.provider";

const ALG = "HS256";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET must be set to a long random string");
  }
  return new TextEncoder().encode(secret);
}

function stripPassword(u: { passwordHash?: string } & PublicUser): PublicUser {
  const { passwordHash: _ignored, ...pub } = u as unknown as PublicUser & { passwordHash?: string };
  void _ignored;
  return pub;
}

async function sign(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(getSecret());
}

export async function signForUser(user: PublicUser): Promise<string> {
  return sign({ userId: user.id, email: user.email, name: user.name, role: user.role });
}

export const jwtAuthProvider: AuthProvider = {
  async register(input: RegisterInput) {
    const existing = await userRepo.findByEmail(input.email);
    if (existing) throw new AuthError("email_taken", "An account with this email already exists");
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await userRepo.create({
      email: input.email,
      passwordHash,
      name: input.name,
      phone: input.phone,
      role: "customer"
    });
    const token = await sign({ userId: user.id, email: user.email, name: user.name, role: user.role });
    return { user: stripPassword(user), token };
  },

  async login(input: LoginInput) {
    const user = await userRepo.findByEmail(input.email);
    if (!user) throw new AuthError("invalid_credentials", "Email or password is incorrect");
    if (!user.passwordHash) {
      throw new AuthError("invalid_credentials", "This account uses Google sign-in. Please continue with Google.");
    }
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new AuthError("invalid_credentials", "Email or password is incorrect");
    const token = await sign({ userId: user.id, email: user.email, name: user.name, role: user.role });
    return { user: stripPassword(user), token };
  },

  async verifyToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALG] });
      const { userId, email, name, role } = payload as unknown as SessionPayload;
      if (!userId || !email || !role) return null;
      return { userId, email, name, role };
    } catch {
      return null;
    }
  }
};
