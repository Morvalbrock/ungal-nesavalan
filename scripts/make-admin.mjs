// Promote a registered user to admin.
// Usage: npm run make:admin -- someone@example.com

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run make:admin -- someone@example.com");
  process.exit(1);
}

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
console.log(`OK ${email} is now an admin.`);
console.log("IMPORTANT: log out and log back in to refresh your session cookie with the new role.");
