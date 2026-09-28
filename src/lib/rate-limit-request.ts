import { NextResponse } from "next/server";
import { limit, type RateLimitOptions, type RateLimitResult } from "./rate-limit";

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    // First entry is the original client. May be spoofed if you're not behind
    // a trusted proxy — acceptable for anti-abuse throttling, not for auth.
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}

export interface CheckOptions extends RateLimitOptions {
  bucket: string;
  key?: string;
}

export function checkRateLimit(req: Request, opts: CheckOptions): RateLimitResult {
  const ip = getClientIp(req);
  const composite = `${opts.bucket}:${opts.key ?? ip}`;
  return limit(composite, { max: opts.max, windowMs: opts.windowMs });
}

export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    { error: "rate_limited", message: "Too many requests. Please try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSec),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0"
      }
    }
  );
}
