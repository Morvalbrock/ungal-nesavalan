"use server";

import { requestPasswordReset } from "@/features/auth/password-reset.service";

export async function submitForgotPassword(email: string): Promise<{ ok: true }> {
  await requestPasswordReset(email);
  return { ok: true };
}
