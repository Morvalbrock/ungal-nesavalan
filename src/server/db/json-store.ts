import { promises as fs, existsSync } from "node:fs";
import path from "node:path";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Storage layer for all 16 repositories.
// - With DATABASE_URL set: backs onto Neon Postgres, one row per collection in `collections`.
// - Without DATABASE_URL: falls back to file-based JSON under ./data (local dev only).
// The public API is identical to the previous file-only implementation, so
// no repository needs to change.

const DATA_DIR = path.join(process.cwd(), "data");
const SEED_DIR = path.join(DATA_DIR, "seed");
const DATABASE_URL = process.env.DATABASE_URL;
const USE_DB = Boolean(DATABASE_URL);

// ---------------------------------------------------------------------------
// Neon pool (cached on globalThis so hot-reload in dev doesn't leak sockets)
// ---------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var __neonPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __neonSchemaInit: Promise<void> | undefined;
}

function getPool(): Pool {
  if (!globalThis.__neonPool) {
    if (typeof WebSocket === "undefined") {
      neonConfig.webSocketConstructor = ws as unknown as typeof WebSocket;
    }
    globalThis.__neonPool = new Pool({ connectionString: DATABASE_URL });
  }
  return globalThis.__neonPool!;
}

async function ensureSchema(): Promise<void> {
  if (!globalThis.__neonSchemaInit) {
    globalThis.__neonSchemaInit = (async () => {
      const client = await getPool().connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS collections (
            name TEXT PRIMARY KEY,
            rows JSONB NOT NULL DEFAULT '[]'::jsonb,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);
      } finally {
        client.release();
      }
    })().catch((err) => {
      globalThis.__neonSchemaInit = undefined;
      throw err;
    });
  }
  return globalThis.__neonSchemaInit;
}

async function loadSeed<T>(name: string, fallback: T[]): Promise<T[]> {
  const seedFile = path.join(SEED_DIR, `${name}.json`);
  if (!existsSync(seedFile)) return [...fallback];
  try {
    const raw = await fs.readFile(seedFile, "utf8");
    if (!raw.trim()) return [...fallback];
    return JSON.parse(raw) as T[];
  } catch {
    return [...fallback];
  }
}

// ---------------------------------------------------------------------------
// Postgres implementation
// ---------------------------------------------------------------------------

async function pgRead<T>(name: string, fallback: T[]): Promise<T[]> {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    const existing = await client.query<{ rows: T[] }>(
      "SELECT rows FROM collections WHERE name = $1",
      [name]
    );
    if (existing.rows.length > 0) return existing.rows[0].rows;
    const seeded = await loadSeed(name, fallback);
    await client.query(
      `INSERT INTO collections (name, rows) VALUES ($1, $2::jsonb)
       ON CONFLICT (name) DO NOTHING`,
      [name, JSON.stringify(seeded)]
    );
    // Re-read to win over a concurrent mutator that inserted first.
    const after = await client.query<{ rows: T[] }>(
      "SELECT rows FROM collections WHERE name = $1",
      [name]
    );
    return after.rows[0]?.rows ?? seeded;
  } finally {
    client.release();
  }
}

async function pgWrite<T>(name: string, rows: T[]): Promise<void> {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query(
      `INSERT INTO collections (name, rows) VALUES ($1, $2::jsonb)
       ON CONFLICT (name) DO UPDATE SET rows = EXCLUDED.rows, updated_at = NOW()`,
      [name, JSON.stringify(rows)]
    );
  } finally {
    client.release();
  }
}

async function pgMutate<T>(
  name: string,
  fallback: T[],
  fn: (rows: T[]) => T[] | Promise<T[]>
): Promise<T[]> {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    // SELECT FOR UPDATE locks the row so concurrent mutators serialize.
    // If the row doesn't exist yet, seed it (idempotent under ON CONFLICT)
    // then re-lock the now-existing row.
    let locked = await client.query<{ rows: T[] }>(
      "SELECT rows FROM collections WHERE name = $1 FOR UPDATE",
      [name]
    );
    let current: T[];
    if (locked.rows.length === 0) {
      const seeded = await loadSeed(name, fallback);
      await client.query(
        `INSERT INTO collections (name, rows) VALUES ($1, $2::jsonb)
         ON CONFLICT (name) DO NOTHING`,
        [name, JSON.stringify(seeded)]
      );
      locked = await client.query<{ rows: T[] }>(
        "SELECT rows FROM collections WHERE name = $1 FOR UPDATE",
        [name]
      );
      current = locked.rows[0]?.rows ?? seeded;
    } else {
      current = locked.rows[0].rows;
    }

    const next = await fn(current);
    await client.query(
      "UPDATE collections SET rows = $2::jsonb, updated_at = NOW() WHERE name = $1",
      [name, JSON.stringify(next)]
    );
    await client.query("COMMIT");
    return next;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// File-based fallback (local dev without DATABASE_URL)
// ---------------------------------------------------------------------------

const fileLocks = new Map<string, Promise<unknown>>();

async function fileWithLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = fileLocks.get(key) ?? Promise.resolve();
  const next = prev.catch(() => undefined).then(fn);
  fileLocks.set(key, next);
  try {
    return await next;
  } finally {
    if (fileLocks.get(key) === next) fileLocks.delete(key);
  }
}

async function fileEnsure(file: string, seedName: string, fallback: unknown): Promise<void> {
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

async function fileRead<T>(name: string, fallback: T[]): Promise<T[]> {
  const file = path.join(DATA_DIR, `${name}.json`);
  return fileWithLock(name, async () => {
    await fileEnsure(file, `${name}.json`, fallback);
    const raw = await fs.readFile(file, "utf8");
    if (!raw.trim()) return [...fallback];
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [...fallback];
    }
  });
}

async function fileWrite<T>(name: string, rows: T[]): Promise<void> {
  const file = path.join(DATA_DIR, `${name}.json`);
  await fileWithLock(name, async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(rows, null, 2), "utf8");
    await fs.rename(tmp, file);
  });
}

async function fileMutate<T>(
  name: string,
  fallback: T[],
  fn: (rows: T[]) => T[] | Promise<T[]>
): Promise<T[]> {
  const file = path.join(DATA_DIR, `${name}.json`);
  return fileWithLock(name, async () => {
    await fileEnsure(file, `${name}.json`, fallback);
    const raw = await fs.readFile(file, "utf8");
    const current = raw.trim() ? (JSON.parse(raw) as T[]) : [...fallback];
    const next = await fn(current);
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
    await fs.rename(tmp, file);
    return next;
  });
}

// ---------------------------------------------------------------------------
// Public API — unchanged signatures
// ---------------------------------------------------------------------------

export async function readCollection<T>(name: string, fallback: T[] = []): Promise<T[]> {
  return USE_DB ? pgRead(name, fallback) : fileRead(name, fallback);
}

export async function writeCollection<T>(name: string, rows: T[]): Promise<void> {
  return USE_DB ? pgWrite(name, rows) : fileWrite(name, rows);
}

export async function mutateCollection<T>(
  name: string,
  fallback: T[],
  fn: (rows: T[]) => T[] | Promise<T[]>
): Promise<T[]> {
  return USE_DB ? pgMutate(name, fallback, fn) : fileMutate(name, fallback, fn);
}

export function newId(prefix = ""): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return prefix ? `${prefix}_${ts}${rand}` : `${ts}${rand}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
