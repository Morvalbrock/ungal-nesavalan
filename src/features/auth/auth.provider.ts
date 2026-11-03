import { z } from "zod";
import type { PublicUser, UserRole } from "@/types/user";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[- ]?)?[6-9]\d{9}$/, "Enter a valid Indian mobile number")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[- ]?)?[6-9]\d{9}$/, "Enter a valid Indian mobile number")
});

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[- ]?)?[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
  otp: z.string().trim().length(6, "OTP must be 6 digits").regex(/^\d{6}$/, "OTP must be 6 digits")
});

export const firebaseLoginSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[- ]?)?[6-9]\d{9}$/, "Enter a valid Indian mobile number")
    .optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type FirebaseLoginInput = z.infer<typeof firebaseLoginSchema>;

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthProvider {
  register(input: RegisterInput): Promise<{ user: PublicUser; token: string }>;
  login(input: LoginInput): Promise<{ user: PublicUser; token: string }>;
  verifyToken(token: string): Promise<SessionPayload | null>;
}

export class AuthError extends Error {
  readonly code: "invalid_credentials" | "email_taken" | "invalid_token" | "otp_failed" | "phone_required";
  constructor(code: AuthError["code"], message: string) {
    super(message);
    this.code = code;
  }
}
