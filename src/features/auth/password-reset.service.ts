import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { passwordResetRepo, userRepo } from "@/server/repositories";
import { getMailProvider } from "@/features/mail";
import { passwordResetEmail } from "@/features/mail/templates";

const TOKEN_TTL_MINUTES = 60;
const TOKEN_BYTES = 32;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function requestPasswordReset(email: string): Promise<void> {
  const normalised = email.trim().toLowerCase();
  if (!normalised) return;
  const user = await userRepo.findByEmail(normalised);
  if (!user) return;
  if (!user.passwordHash) return;

  await passwordResetRepo.invalidateAllForUser(user.id);

  const token = randomBytes(TOKEN_BYTES).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000).toISOString();
  const record = await passwordResetRepo.create({ userId: user.id, tokenHash, expiresAt });

  const resetUrl = `${siteUrl()}/reset-password?id=${encodeURIComponent(record.id)}&token=${encodeURIComponent(token)}`;
  try {
    const { subject, html } = passwordResetEmail({
      customerName: user.name,
      resetUrl,
      expiresInMinutes: TOKEN_TTL_MINUTES
    });
    await getMailProvider().send({
      to: user.email,
      subject,
      html,
      tags: { event: "password_reset_request", userId: user.id }
    });
  } catch (err) {
    console.error("[password-reset] email failed:", (err as Error).message);
  }
}

export type VerifyResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid" | "expired" | "used" };

export async function verifyResetToken(id: string, token: string): Promise<VerifyResult> {
  if (!id || !token) return { ok: false, reason: "invalid" };
  const record = await passwordResetRepo.findById(id);
  if (!record) return { ok: false, reason: "invalid" };
  if (record.usedAt) return { ok: false, reason: "used" };
  if (new Date(record.expiresAt).getTime() < Date.now()) return { ok: false, reason: "expired" };

  const presented = hashToken(token);
  const stored = record.tokenHash;
  const a = Buffer.from(presented, "hex");
  const b = Buffer.from(stored, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: true, userId: record.userId };
}

export type ConsumeResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "used" | "weak" | "failed" };

export async function consumeResetToken(
  id: string,
  token: string,
  newPassword: string
): Promise<ConsumeResult> {
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return { ok: false, reason: "weak" };
  }
  const check = await verifyResetToken(id, token);
  if (!check.ok) return { ok: false, reason: check.reason };

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const updated = await userRepo.update(check.userId, { passwordHash });
  if (!updated) return { ok: false, reason: "failed" };
  await passwordResetRepo.markUsed(id);
  return { ok: true };
}
