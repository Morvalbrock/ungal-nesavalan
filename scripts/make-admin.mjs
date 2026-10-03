// Promote a registered user to admin or super_admin.
// Usage:
//   npm run make:admin -- someone@example.com                 → sets role to "admin"
//   npm run make:admin -- someone@example.com super_admin     → sets role to "super_admin"
//   npm run make:admin -- someone@example.com customer        → demotes to "customer"
//
// With DATABASE_URL set (production/demo): updates the users collection in Neon.
// Without: falls back to editing data/users.json (local dev).

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const VALID_ROLES = new Set(["customer", "admin", "super_admin"]);

const email = process.argv[2];
const requestedRole = process.argv[3] ?? "admin";

if (!email) {
  console.error("Usage: npm run make:admin -- someone@example.com [role]");
  console.error("  role: customer | admin | super_admin (default: admin)");
  process.exit(1);
}
if (!VALID_ROLES.has(requestedRole)) {
  console.error(`Invalid role "${requestedRole}". Must be one of: ${[...VALID_ROLES].join(", ")}`);
  process.exit(1);
}

const DATABASE_URL = process.env.DATABASE_URL;

if (DATABASE_URL) {
  await updateInNeon(email, requestedRole);
} else {
  await updateInFile(email, requestedRole);
}

async function updateInNeon(email, role) {
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
    if (target.role === role) {
      console.log(`${email} is already a ${role}. Nothing to do.`);
      await client.query("COMMIT");
      return;
    }
    const previousRole = target.role;
    target.role = role;
    await client.query(
      "UPDATE collections SET rows = $2::jsonb, updated_at = NOW() WHERE name = $1",
      ["users", JSON.stringify(users)]
    );
    await client.query("COMMIT");
    console.log(`OK ${email}: ${previousRole} → ${role} (Neon).`);
    console.log("IMPORTANT: log out and log back in to refresh your session cookie.");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

async function updateInFile(email, role) {
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

  if (target.role === role) {
    console.log(`${email} is already a ${role}. Nothing to do.`);
    process.exit(0);
  }

  const previousRole = target.role;
  target.role = role;
  await writeFile(file, JSON.stringify(rows, null, 2), "utf8");
  console.log(`OK ${email}: ${previousRole} → ${role} (file).`);
  console.log("IMPORTANT: log out and log back in to refresh your session cookie with the new role.");
}
