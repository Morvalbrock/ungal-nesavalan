/**
 * OTP Service — MSG91 integration
 *
 * MSG91 docs: https://docs.msg91.com/reference/send-otp
 *
 * Free tier: 5,000 OTP credits on sign-up (no credit card).
 * Pricing after: ₹0.16–0.20 per SMS.
 *
 * Environment variables required:
 *   MSG91_AUTH_KEY    — From MSG91 dashboard → API Keys
 *   MSG91_TEMPLATE_ID — OTP template ID (created in MSG91 dashboard)
 */

const MSG91_AUTH_KEY = () => process.env.MSG91_AUTH_KEY ?? "";
const MSG91_TEMPLATE_ID = () => process.env.MSG91_TEMPLATE_ID ?? "";
const MSG91_BASE = "https://control.msg91.com/api/v5";

/** Normalise an Indian mobile number to E.164 format: +91XXXXXXXXXX */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  // "9876543210" → "+919876543210"
  if (digits.length === 10) return `+91${digits}`;
  // "919876543210" → "+919876543210"
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  // Already has country code with +
  if (raw.startsWith("+") && digits.length >= 12) return `+${digits}`;
  return `+${digits}`;
}

export interface OtpResult {
  success: boolean;
  message: string;
  type?: string;
}

/**
 * Send OTP to the given phone number.
 * In dev mode (no MSG91_AUTH_KEY), logs a static OTP to the console.
 */
export async function sendOtp(phone: string): Promise<OtpResult> {
  const normalized = normalizePhone(phone);
  const authKey = MSG91_AUTH_KEY();
  const templateId = MSG91_TEMPLATE_ID();

  // Dev fallback — no MSG91 keys configured
  if (!authKey || !templateId) {
    console.log(`[OTP-DEV] OTP for ${normalized}: 123456 (dev mode — set MSG91_AUTH_KEY & MSG91_TEMPLATE_ID for real SMS)`);
    return { success: true, message: "OTP sent (dev mode)", type: "dev" };
  }

  const url = `${MSG91_BASE}/otp?template_id=${templateId}&mobile=${encodeURIComponent(normalized)}&otp_length=6&otp_expiry=5`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      authkey: authKey,
      "Content-Type": "application/json"
    }
  });

  const body = await res.json().catch(() => ({ type: "error", message: "Unknown MSG91 error" }));

  if (body.type === "success" || body.type === "sent") {
    return { success: true, message: "OTP sent successfully", type: body.type };
  }

  console.error("[OTP] MSG91 send error:", body);
  return { success: false, message: body.message ?? "Failed to send OTP" };
}

/**
 * Verify the OTP entered by the user.
 * In dev mode, accepts "123456" as valid OTP.
 */
export async function verifyOtp(phone: string, otp: string): Promise<OtpResult> {
  const normalized = normalizePhone(phone);
  const authKey = MSG91_AUTH_KEY();

  // Dev fallback
  if (!authKey) {
    if (otp === "123456") {
      return { success: true, message: "OTP verified (dev mode)", type: "dev" };
    }
    return { success: false, message: "Invalid OTP. Use 123456 in dev mode." };
  }

  const url = `${MSG91_BASE}/otp/verify?mobile=${encodeURIComponent(normalized)}&otp=${encodeURIComponent(otp)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { authkey: authKey }
  });

  const body = await res.json().catch(() => ({ type: "error", message: "Unknown MSG91 error" }));

  if (body.type === "success") {
    return { success: true, message: "OTP verified", type: body.type };
  }

  return { success: false, message: body.message ?? "Invalid OTP" };
}

/**
 * Resend OTP (via SMS or voice call).
 */
export async function resendOtp(phone: string, retryType: "text" | "voice" = "text"): Promise<OtpResult> {
  const normalized = normalizePhone(phone);
  const authKey = MSG91_AUTH_KEY();

  if (!authKey) {
    console.log(`[OTP-DEV] Resend OTP for ${normalized}: 123456 (dev mode)`);
    return { success: true, message: "OTP resent (dev mode)", type: "dev" };
  }

  const url = `${MSG91_BASE}/otp/retry?mobile=${encodeURIComponent(normalized)}&retrytype=${retryType}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { authkey: authKey }
  });

  const body = await res.json().catch(() => ({ type: "error", message: "Unknown MSG91 error" }));

  if (body.type === "success") {
    return { success: true, message: "OTP resent", type: body.type };
  }

  return { success: false, message: body.message ?? "Failed to resend OTP" };
}
