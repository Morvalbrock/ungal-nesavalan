import "server-only";

export interface PincodeInfo {
  serviceable: boolean;
  city?: string;
  district?: string;
  state?: string;
  locationLabel?: string;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX = 500;
const TIMEOUT_MS = 3000;
const API_URL = "https://api.postalpincode.in/pincode";

const cache = new Map<string, { data: PincodeInfo; expiresAt: number }>();

export async function lookupPincode(pincode: string): Promise<PincodeInfo> {
  const clean = pincode.trim();
  if (!/^\d{6}$/.test(clean)) return { serviceable: false };

  const cached = cache.get(clean);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}/${clean}`, { signal: controller.signal });
    if (!res.ok) return failOpen();
    const info = parsePincodeResponse(await res.json());
    cacheSet(clean, info);
    return info;
  } catch {
    return failOpen();
  } finally {
    clearTimeout(timer);
  }
}

function failOpen(): PincodeInfo {
  return { serviceable: true };
}

function parsePincodeResponse(data: unknown): PincodeInfo {
  if (!Array.isArray(data) || data.length === 0) return failOpen();
  const first = data[0] as { Status?: string; PostOffice?: unknown };
  if (
    first.Status !== "Success" ||
    !Array.isArray(first.PostOffice) ||
    first.PostOffice.length === 0
  ) {
    return { serviceable: false };
  }
  const po = first.PostOffice[0] as { Name?: string; District?: string; State?: string };
  const city = typeof po.Name === "string" ? po.Name : undefined;
  const district = typeof po.District === "string" ? po.District : undefined;
  const state = typeof po.State === "string" ? po.State : undefined;
  const locationLabel = [district, state].filter(Boolean).join(", ") || undefined;
  return { serviceable: true, city, district, state, locationLabel };
}

function cacheSet(key: string, data: PincodeInfo) {
  if (cache.size >= CACHE_MAX) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}
