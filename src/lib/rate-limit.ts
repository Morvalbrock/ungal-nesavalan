// Sliding-window in-memory rate limiter. Zero dependencies, single-instance.
//
// Swap-out path: replace `RateLimiter` with an Upstash/Redis implementation
// exposing the same `limit()` signature — no callsites change.
//
// Not durable across restarts; not shared across processes. Adequate for a
// single Node host (VPS/Fly/Render). For Vercel/Lambda or horizontal scale,
// swap to @upstash/ratelimit before launch.

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfterSec: number;
}

export interface RateLimitOptions {
  max: number;
  windowMs: number;
}

const buckets = new Map<string, number[]>();

let lastSweepAt = 0;
const SWEEP_INTERVAL_MS = 5 * 60_000;

function sweep(now: number) {
  if (now - lastSweepAt < SWEEP_INTERVAL_MS) return;
  lastSweepAt = now;
  // Drop buckets that haven't been touched in over an hour.
  const cutoff = now - 60 * 60_000;
  for (const [key, stamps] of buckets) {
    if (stamps.length === 0 || stamps[stamps.length - 1] < cutoff) {
      buckets.delete(key);
    }
  }
}

export function limit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const windowStart = now - opts.windowMs;
  const stamps = buckets.get(key) ?? [];
  // Drop stamps that have aged out of the window.
  const fresh: number[] = [];
  for (const t of stamps) if (t > windowStart) fresh.push(t);

  if (fresh.length >= opts.max) {
    buckets.set(key, fresh);
    const oldest = fresh[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldest + opts.windowMs - now) / 1000));
    return { ok: false, limit: opts.max, remaining: 0, retryAfterSec };
  }

  fresh.push(now);
  buckets.set(key, fresh);
  return {
    ok: true,
    limit: opts.max,
    remaining: opts.max - fresh.length,
    retryAfterSec: 0
  };
}

// Test-only helper. Not exported from any barrel.
export function __resetRateLimits() {
  buckets.clear();
  lastSweepAt = 0;
}
