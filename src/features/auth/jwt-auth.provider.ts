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
import { normalizePhone } from "./otp.service";

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

/**
 * Login (or auto-register) a user by verified phone number.
 */
export async function loginWithPhone(phone: string): Promise<{ user: PublicUser; token: string; isNewUser: boolean }> {
  return loginWithFirebaseUser({ uid: `phone_${phone}`, phone });
}

/**
 * Login (or auto-register) a user authenticated via Firebase (Email, Phone, Google).
 */
export async function loginWithFirebaseUser(data: {
  uid: string;
  email?: string;
  phone?: string;
  name?: string;
}): Promise<{ user: PublicUser; token: string; isNewUser: boolean }> {
  let user: PublicUser | null = null;
  let isNewUser = false;

  if (data.email) {
    user = await userRepo.findByEmail(data.email);
  }
  if (!user && data.phone) {
    const normalized = normalizePhone(data.phone);
    user = await userRepo.findByPhone(normalized);
  }

  if (!user) {
    isNewUser = true;
    const email =
      data.email ||
      (data.phone
        ? `${normalizePhone(data.phone).replace("+", "")}@phone.local`
        : `${data.uid}@firebase.local`);
    const name =
      data.name ||
      (data.phone
        ? normalizePhone(data.phone)
        : data.email
          ? data.email.split("@")[0]
          : "Customer");

    const created = await userRepo.create({
      email,
      name,
      phone: data.phone ? normalizePhone(data.phone) : undefined,
      role: "customer"
    });
    user = created;
  } else {
    const patch: Partial<PublicUser> = {};
    if (!user.phone && data.phone) patch.phone = normalizePhone(data.phone);
    if (!user.name && data.name) patch.name = data.name;
    if (Object.keys(patch).length > 0) {
      await userRepo.update(user.id, patch);
      user = { ...user, ...patch };
    }
  }

  const token = await sign({ userId: user.id, email: user.email, name: user.name, role: user.role });
  return { user: stripPassword(user), token, isNewUser };
}
