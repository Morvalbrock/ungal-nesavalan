// One-shot migration: pushes every data/*.json into the MySQL `collections` table.
// Idempotent — running twice overwrites with the current file contents.
//
// Usage:
//   npm run db:migrate
//
// Reads DATABASE_URL from .env.local (via node --env-file).

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");

if (!process.env.DB_HOST) {
  console.error("DB_HOST is not set. Add DB_HOST/DB_USER/DB_PASS/DB_NAME to .env.local and retry.");
  process.exit(1);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

async function main() {
  const conn = await pool.getConnection();
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS collections (
        name VARCHAR(191) PRIMARY KEY,
        \`rows\` JSON NOT NULL,
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
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
      await conn.execute(
        "INSERT INTO collections (name, `rows`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `rows` = VALUES(`rows`), updated_at = NOW()",
        [name, JSON.stringify(rows)]
      );
      console.log(`OK ${name} (${rows.length} rows)`);
      migrated++;
    }

    console.log(`\nDone. Migrated ${migrated}, skipped ${skipped}.`);
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
