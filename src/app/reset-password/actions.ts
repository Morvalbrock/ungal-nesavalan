"use server";

import { consumeResetToken } from "@/features/auth/password-reset.service";

const ERROR_COPY = {
  invalid: "This reset link isn’t valid.",
  expired: "This reset link has expired. Request a new one.",
  used: "This reset link has already been used.",
  weak: "Password must be at least 8 characters.",
  failed: "Something went wrong updating your password. Please try again."
} as const;

export async function submitResetPassword(input: {
  id: string;
  token: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await consumeResetToken(input.id, input.token, input.password);
  if (result.ok) return { ok: true };
  return { ok: false, error: ERROR_COPY[result.reason] };
}
