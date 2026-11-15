import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getSession } from "@/features/auth/session";
import { userRepo } from "@/server/repositories";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit-request";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"]
  });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized", message: "Please sign in to continue" }, { status: 401 });
  }

  const ip = getClientIp(req);
  const rl = checkRateLimit(req, {
    bucket: "account:change-password",
    key: `${ip}:${session.userId}`,
    max: 5,
    windowMs: 15 * 60_000
  });
  if (!rl.ok) return rateLimitResponse(rl);

  const raw = await req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
    return NextResponse.json(
      {
        error: "invalid_input",
        message: firstIssue ?? "Please check your inputs",
        issues: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await userRepo.findById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "not_found", message: "User account not found" }, { status: 404 });
  }

  // If user already has a password, verify the current password
  if (user.passwordHash) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: "current_password_required", message: "Current password is required to set a new password" },
        { status: 400 }
      );
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "current_password_incorrect", message: "Current password is incorrect" },
        { status: 400 }
      );
    }
  }

  // Hash new password and persist
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await userRepo.update(user.id, { passwordHash });

  return NextResponse.json({
    ok: true,
    message: user.passwordHash ? "Password changed successfully" : "Password set successfully"
  });
}
