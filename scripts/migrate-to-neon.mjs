// One-shot migration: pushes every data/*.json into the Neon `collections` table.
// Idempotent — running twice overwrites with the current file contents.
//
// Usage:
//   npm run db:migrate
//
// Reads DATABASE_URL from .env.local (via node --env-file).

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.local and retry.");
  process.exit(1);
}

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS collections (
        name TEXT PRIMARY KEY,
        rows JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const entries = await readdir(DATA_DIR, { withFileTypes: true });
    let migrated = 0;
    let skipped = 0;

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
      const name = entry.name.replace(/\.json$/, "");
      const raw = await readFile(path.join(DATA_DIR, entry.name), "utf8");
      if (!raw.trim()) {
        console.log(`- ${name} (empty, skipped)`);
        skipped++;
        continue;
      }
      let rows;
      try {
        rows = JSON.parse(raw);
      } catch {
        console.warn(`- ${name} (invalid JSON, skipped)`);
        skipped++;
        continue;
      }
      if (!Array.isArray(rows)) {
        console.warn(`- ${name} (not an array, skipped)`);
        skipped++;
        continue;
      }
      await client.query(
        `INSERT INTO collections (name, rows) VALUES ($1, $2::jsonb)
         ON CONFLICT (name) DO UPDATE SET rows = EXCLUDED.rows, updated_at = NOW()`,
        [name, JSON.stringify(rows)]
      );
      console.log(`OK ${name} (${rows.length} rows)`);
      migrated++;
    }

    console.log(`\nDone. Migrated ${migrated}, skipped ${skipped}.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
