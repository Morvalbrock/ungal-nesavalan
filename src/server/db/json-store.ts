import { promises as fs, existsSync } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const SEED_DIR = path.join(DATA_DIR, "seed");

const locks = new Map<string, Promise<unknown>>();

async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.catch(() => undefined).then(fn);
  locks.set(key, next);
  try {
    return await next;
  } finally {
    if (locks.get(key) === next) locks.delete(key);
  }
}

async function ensureFile(file: string, seedName: string, fallback: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  if (existsSync(file)) return;
  const seedFile = path.join(SEED_DIR, seedName);
  if (existsSync(seedFile)) {
    const raw = await fs.readFile(seedFile, "utf8");
    await fs.writeFile(file, raw, "utf8");
    return;
  }
  await fs.writeFile(file, JSON.stringify(fallback, null, 2), "utf8");
}

export async function readCollection<T>(name: string, fallback: T[] = []): Promise<T[]> {
  const file = path.join(DATA_DIR, `${name}.json`);
  const seed = `${name}.json`;
  return withLock(name, async () => {
    await ensureFile(file, seed, fallback);
    const raw = await fs.readFile(file, "utf8");
    if (!raw.trim()) return [...fallback];
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [...fallback];
    }
  });
}

export async function writeCollection<T>(name: string, rows: T[]): Promise<void> {
  const file = path.join(DATA_DIR, `${name}.json`);
  await withLock(name, async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(rows, null, 2), "utf8");
    await fs.rename(tmp, file);
  });
}

export async function mutateCollection<T>(
  name: string,
  fallback: T[],
  fn: (rows: T[]) => T[] | Promise<T[]>
): Promise<T[]> {
  const file = path.join(DATA_DIR, `${name}.json`);
  const seed = `${name}.json`;
  return withLock(name, async () => {
    await ensureFile(file, seed, fallback);
    const raw = await fs.readFile(file, "utf8");
    const current = raw.trim() ? (JSON.parse(raw) as T[]) : [...fallback];
    const next = await fn(current);
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
    await fs.rename(tmp, file);
    return next;
  });
}

export function newId(prefix = ""): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return prefix ? `${prefix}_${ts}${rand}` : `${ts}${rand}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
