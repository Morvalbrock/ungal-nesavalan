import { promises as fs, existsSync } from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import type { RowDataPacket } from "mysql2";

// Storage layer for all repositories.
// - With DB_HOST set: backs onto MySQL, one row per collection in `collections`.
// - Without DB_HOST: falls back to file-based JSON under ./data (local dev only).
// The public API is identical to the previous implementation.

const DATA_DIR = path.join(process.cwd(), "data");
const SEED_DIR = path.join(DATA_DIR, "seed");
const DATABASE_URL = process.env.DATABASE_URL;
const DB_HOST = process.env.DB_HOST;
const USE_DB = Boolean(DATABASE_URL || DB_HOST);

if (process.env.VERCEL_ENV && !USE_DB) {
  console.error(
    "[json-store] FATAL: Database credentials (DATABASE_URL or DB_HOST) are missing on Vercel " +
      (process.env.VERCEL_ENV ?? "?") +
      ". Runtime will attempt filesystem writes and crash with EROFS. " +
      "Set DATABASE_URL or DB_HOST/DB_USER/DB_PASS/DB_NAME in Vercel Project Settings → Environment Variables."
  );
}

// ---------------------------------------------------------------------------
// MySQL pool (cached on globalThis so hot-reload in dev doesn't leak connections)
// ---------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined;
  // eslint-disable-next-line no-var
  var __mysqlSchemaInit: Promise<void> | undefined;
}

function getPool(): mysql.Pool {
  if (!globalThis.__mysqlPool) {
    if (DATABASE_URL) {
      globalThis.__mysqlPool = mysql.createPool(DATABASE_URL);
    } else {
      globalThis.__mysqlPool = mysql.createPool({
        host: DB_HOST,
        port: Number(process.env.DB_PORT ?? 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
      });
    }
  }
  return globalThis.__mysqlPool;
}

async function ensureSchema(): Promise<void> {
  if (!globalThis.__mysqlSchemaInit) {
    globalThis.__mysqlSchemaInit = (async () => {
      const conn = await getPool().getConnection();
      try {
        await conn.execute(`
          CREATE TABLE IF NOT EXISTS collections (
            name VARCHAR(191) PRIMARY KEY,
            \`rows\` JSON NOT NULL,
            updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
          )
        `);
      } finally {
        conn.release();
      }
    })().catch((err) => {
      globalThis.__mysqlSchemaInit = undefined;
      throw err;
    });
  }
  return globalThis.__mysqlSchemaInit;
}

function parseRows<T>(val: unknown): T[] {
  if (typeof val === "string") return JSON.parse(val) as T[];
  return val as T[];
}

async function loadSeed<T>(name: string, fallback: T[]): Promise<T[]> {
  const dataFile = path.join(DATA_DIR, `${name}.json`);
  const seedFile = path.join(SEED_DIR, `${name}.json`);
  const fileToUse = existsSync(dataFile) ? dataFile : existsSync(seedFile) ? seedFile : null;
  if (!fileToUse) return [...fallback];
  try {
    const raw = await fs.readFile(fileToUse, "utf8");
    if (!raw.trim()) return [...fallback];
    return JSON.parse(raw) as T[];
  } catch {
    return [...fallback];
  }
}

// ---------------------------------------------------------------------------
// MySQL implementation
// ---------------------------------------------------------------------------

async function dbRead<T>(name: string, fallback: T[]): Promise<T[]> {
  try {
    await ensureSchema();
    const conn = await getPool().getConnection();
    try {
      const existing = (await conn.execute<RowDataPacket[]>(
        "SELECT `rows` FROM collections WHERE name = ?",
        [name]
      ))[0];
      if (existing.length > 0) return parseRows<T>(existing[0].rows);
      const seeded = await loadSeed(name, fallback);
      await conn.execute(
        "INSERT IGNORE INTO collections (name, `rows`) VALUES (?, ?)",
        [name, JSON.stringify(seeded)]
      );
      const after = (await conn.execute<RowDataPacket[]>(
        "SELECT `rows` FROM collections WHERE name = ?",
        [name]
      ))[0];
      return after[0] ? parseRows<T>(after[0].rows) : seeded;
    } finally {
      conn.release();
    }
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT" || code === "ER_ACCESS_DENIED_ERROR") {
      console.warn(`[json-store] Database unreachable (${code}). Falling back to local file storage for "${name}".`);
      return fileRead(name, fallback);
    }
    throw err;
  }
}

async function dbWrite<T>(name: string, rows: T[]): Promise<void> {
  try {
    await ensureSchema();
    const conn = await getPool().getConnection();
    try {
      await conn.execute(
        "INSERT INTO collections (name, `rows`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `rows` = VALUES(`rows`), updated_at = NOW()",
        [name, JSON.stringify(rows)]
      );
    } finally {
      conn.release();
    }
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT" || code === "ER_ACCESS_DENIED_ERROR") {
      console.warn(`[json-store] Database unreachable (${code}). Falling back to file storage for "${name}".`);
      return fileWrite(name, rows);
    }
    throw err;
  }
}

async function dbMutate<T>(
  name: string,
  fallback: T[],
  fn: (rows: T[]) => T[] | Promise<T[]>
): Promise<T[]> {
  try {
    await ensureSchema();
    const conn = await getPool().getConnection();
    try {
      await conn.beginTransaction();

      // SELECT FOR UPDATE locks the row so concurrent mutators serialize.
      let locked = (await conn.execute<RowDataPacket[]>(
        "SELECT `rows` FROM collections WHERE name = ? FOR UPDATE",
        [name]
      ))[0];
      let current: T[];
      if (locked.length === 0) {
        const seeded = await loadSeed(name, fallback);
        await conn.execute(
          "INSERT IGNORE INTO collections (name, `rows`) VALUES (?, ?)",
          [name, JSON.stringify(seeded)]
        );
        locked = (await conn.execute<RowDataPacket[]>(
          "SELECT `rows` FROM collections WHERE name = ? FOR UPDATE",
          [name]
        ))[0];
        current = locked[0] ? parseRows<T>(locked[0].rows) : seeded;
      } else {
        current = parseRows<T>(locked[0].rows);
      }

      const next = await fn(current);
      await conn.execute(
        "UPDATE collections SET `rows` = ?, updated_at = NOW() WHERE name = ?",
        [JSON.stringify(next), name]
      );
      await conn.commit();
      return next;
    } catch (err) {
      await conn.rollback().catch(() => undefined);
      throw err;
    } finally {
      conn.release();
    }
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT" || code === "ER_ACCESS_DENIED_ERROR") {
      console.warn(`[json-store] Database unreachable (${code}). Falling back to file storage for "${name}".`);
      return fileMutate(name, fallback, fn);
    }
    throw err;
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
  return USE_DB ? dbRead(name, fallback) : fileRead(name, fallback);
}

export async function writeCollection<T>(name: string, rows: T[]): Promise<void> {
  return USE_DB ? dbWrite(name, rows) : fileWrite(name, rows);
}

export async function mutateCollection<T>(
  name: string,
  fallback: T[],
  fn: (rows: T[]) => T[] | Promise<T[]>
): Promise<T[]> {
  return USE_DB ? dbMutate(name, fallback, fn) : fileMutate(name, fallback, fn);
}

export function newId(prefix = ""): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return prefix ? `${prefix}_${ts}${rand}` : `${ts}${rand}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
