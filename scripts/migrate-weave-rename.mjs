// One-shot migration: rename stored weave "kanjivaram" → "kanchivaram" in the products collection.
// Idempotent — safe to run twice.
//
// Usage (local, points at .env.local's DB credentials):
//   node --env-file=.env.local scripts/migrate-weave-rename.mjs
//
// On Vercel: run with the production env vars loaded (e.g. `vercel env pull .env.local` first).

import mysql from "mysql2/promise";

const RENAMES = {
  kanjivaram: "kanchivaram"
};

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
  connectionLimit: 2
});

async function main() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      "SELECT `rows` FROM collections WHERE name = 'products' LIMIT 1"
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log("No products collection found in `collections` table — nothing to migrate.");
      return;
    }

    const raw = rows[0].rows;
    const products = Array.isArray(raw) ? raw : JSON.parse(raw);

    let changed = 0;
    for (const p of products) {
      const next = RENAMES[p.weave];
      if (next && next !== p.weave) {
        console.log(`  ${p.slug ?? p.id}: weave "${p.weave}" → "${next}"`);
        p.weave = next;
        changed++;
      }
    }

    if (changed === 0) {
      console.log("Nothing to migrate — all products already use the current weave slugs.");
      return;
    }

    await conn.execute(
      "UPDATE collections SET `rows` = ?, updated_at = NOW() WHERE name = 'products'",
      [JSON.stringify(products)]
    );
    console.log(`\nMigrated ${changed} product(s).`);
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
