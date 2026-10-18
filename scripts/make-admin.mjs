// Promote a registered user to admin or super_admin.
// Usage:
//   npm run make:admin -- someone@example.com                 → sets role to "admin"
//   npm run make:admin -- someone@example.com super_admin     → sets role to "super_admin"
//   npm run make:admin -- someone@example.com customer        → demotes to "customer"
//
// With DATABASE_URL or DB_HOST set: updates the users collection in MySQL.
// Without (or as fallback): edits data/users.json (local dev).

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
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
const DB_HOST = process.env.DB_HOST;
const hasDb = Boolean(DATABASE_URL || DB_HOST);

let dbUser = null;

if (hasDb) {
  dbUser = await updateInDb(email, requestedRole);
}

// Also update or add to data/users.json if the file exists, to keep local file consistent
const fileUpdated = await updateInFile(email, requestedRole, hasDb, dbUser);

if (!dbUser && !fileUpdated) {
  console.error(`Failed to find user "${email}" in ${hasDb ? "database or data/users.json" : "data/users.json"}.`);
  process.exit(1);
}

console.log("\nDone! IMPORTANT: The user must log out and log back in to refresh their session token.");

async function updateInDb(email, role) {
  let mysql;
  try {
    mysql = (await import("mysql2/promise")).default;
  } catch (err) {
    console.warn("mysql2 not available, skipping database update:", err.message);
    return null;
  }

  const pool = DATABASE_URL
    ? mysql.createPool(DATABASE_URL)
    : mysql.createPool({
        host: DB_HOST,
        port: Number(process.env.DB_PORT ?? 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 5,
      });

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [rows] = await conn.execute(
      "SELECT `rows` FROM collections WHERE name = ? FOR UPDATE",
      ["users"]
    );

    if (!rows || rows.length === 0) {
      console.warn("No 'users' collection found in database.");
      await conn.rollback().catch(() => undefined);
      return null;
    }

    const rawVal = rows[0].rows;
    const users = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;

    const target = users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (!target) {
      console.warn(`User ${email} was not found in the database 'users' collection.`);
      console.log("Current registered users in database:", users.map((u) => `${u.email} (${u.role})`).join(", "));
      await conn.rollback().catch(() => undefined);
      return null;
    }

    if (target.role === role) {
      console.log(`Database: ${email} is already ${role}.`);
      await conn.commit();
      return target;
    }

    const previousRole = target.role;
    target.role = role;

    await conn.execute(
      "UPDATE collections SET `rows` = ?, updated_at = NOW() WHERE name = ?",
      [JSON.stringify(users), "users"]
    );

    await conn.commit();
    console.log(`OK ${email}: ${previousRole} → ${role} (Database).`);
    return target;
  } catch (err) {
    if (conn) await conn.rollback().catch(() => undefined);
    console.warn("Database update error:", err.message);
    return null;
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

async function updateInFile(email, role, hasDbConfigured, userRecordFromDb) {
  const file = path.join(process.cwd(), "data", "users.json");
  if (!existsSync(file)) {
    if (!hasDbConfigured) {
      console.error(`data/users.json not found.`);
    }
    return false;
  }

  let rows;
  try {
    const raw = await readFile(file, "utf8");
    rows = JSON.parse(raw);
  } catch (err) {
    console.error("Error reading data/users.json:", err.message);
    return false;
  }

  const target = rows.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());
  if (!target) {
    if (userRecordFromDb) {
      rows.push(userRecordFromDb);
      await writeFile(file, JSON.stringify(rows, null, 2), "utf8");
      console.log(`OK ${email}: synced as ${role} to data/users.json.`);
      return true;
    }
    if (!hasDbConfigured) {
      console.error(`No user with email ${email} found in data/users.json.`);
    }
    return false;
  }

  if (target.role === role) {
    console.log(`File: ${email} is already ${role}.`);
    return true;
  }

  const previousRole = target.role;
  target.role = role;
  await writeFile(file, JSON.stringify(rows, null, 2), "utf8");
  console.log(`OK ${email}: ${previousRole} → ${role} (data/users.json).`);
  return true;
}
