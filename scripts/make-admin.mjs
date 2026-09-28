// Promote a registered user to admin.
// Usage: npm run make:admin -- someone@example.com
//
// With DATABASE_URL set (production/demo): updates the users collection in Neon.
// Without: falls back to editing data/users.json (local dev).

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run make:admin -- someone@example.com");
  process.exit(1);
}

const DATABASE_URL = process.env.DATABASE_URL;

if (DATABASE_URL) {
  await updateInNeon(email);
} else {
  await updateInFile(email);
}

async function updateInNeon(email) {
  const { Pool, neonConfig } = await import("@neondatabase/serverless");
  const ws = (await import("ws")).default;
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await client.query(
      "SELECT rows FROM collections WHERE name = $1 FOR UPDATE",
      ["users"]
    );
    if (res.rows.length === 0) {
      console.error("No users collection in Neon. Register a user first at /register.");
      process.exit(1);
    }
    const users = res.rows[0].rows;
    const target = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!target) {
      console.error(`No user with email ${email}. Register first at /register.`);
      process.exit(1);
    }
    if (target.role === "admin") {
      console.log(`${email} is already an admin. Nothing to do.`);
      await client.query("COMMIT");
      return;
    }
    target.role = "admin";
    await client.query(
      "UPDATE collections SET rows = $2::jsonb, updated_at = NOW() WHERE name = $1",
      ["users", JSON.stringify(users)]
    );
    await client.query("COMMIT");
    console.log(`OK ${email} is now an admin (Neon).`);
    console.log("IMPORTANT: log out and log back in to refresh your session cookie.");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

async function updateInFile(email) {
  const file = path.join(process.cwd(), "data", "users.json");
  let rows;
  try {
    const raw = await readFile(file, "utf8");
    rows = JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(`data/users.json not found. Register the user at /register first, then re-run this script.`);
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }

  const target = rows.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!target) {
    console.error(`No user with email ${email}. Register first at /register.`);
    process.exit(1);
  }

  if (target.role === "admin") {
    console.log(`${email} is already an admin. Nothing to do.`);
    process.exit(0);
  }

  target.role = "admin";
  await writeFile(file, JSON.stringify(rows, null, 2), "utf8");
  console.log(`OK ${email} is now an admin (file).`);
  console.log("IMPORTANT: log out and log back in to refresh your session cookie with the new role.");
}
