import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const DATABASE_URL = process.env.DATABASE_URL;
const DB_HOST = process.env.DB_HOST;

const testProduct = {
  id: "prd_test_payment_1",
  slug: "test-product-1rs",
  name: "Testing Drape (₹1 Payment Test)",
  description: "Test product for payment verification. Price: ₹1 with 0 addon/shipping fee.",
  basePrice: 100, // 100 paise = ₹1.00
  salePrice: 100,
  fabric: "silk",
  weave: "handloom",
  occasion: ["casual", "daily"],
  region: "Tamil Nadu",
  lengthMeters: 6.3,
  blousePieceIncluded: false,
  careInstructions: "Dry clean or gentle hand wash.",
  categoryId: "cat_silk",
  images: [
    {
      id: "img_test_p1",
      url: "/images/img.png",
      alt: "Testing Drape",
      sort: 1
    }
  ],
  variants: [
    {
      id: "var_test_p1",
      productId: "prd_test_payment_1",
      color: "Test Silk",
      colorHex: "#800020",
      sku: "TEST-01",
      stock: 9999,
      priceOverride: 100,
      images: []
    }
  ],
  featured: true,
  published: true,
  freeShipping: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

async function main() {
  console.log("Adding/updating test product...");

  // 1. Update in MySQL if configured
  if (DATABASE_URL || DB_HOST) {
    try {
      const mysql = (await import("mysql2/promise")).default;
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

      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const [rows] = await conn.execute(
          "SELECT `rows` FROM collections WHERE name = ? FOR UPDATE",
          ["products"]
        );

        let products = [];
        if (rows && rows.length > 0) {
          const raw = rows[0].rows;
          products = typeof raw === "string" ? JSON.parse(raw) : raw;
        }

        const existingIdx = products.findIndex(
          (p) => p.id === testProduct.id || p.slug === testProduct.slug
        );

        if (existingIdx >= 0) {
          products[existingIdx] = { ...products[existingIdx], ...testProduct, updatedAt: new Date().toISOString() };
          console.log("Updated existing test product in MySQL.");
        } else {
          products.unshift(testProduct);
          console.log("Inserted test product into MySQL.");
        }

        await conn.execute(
          "INSERT INTO collections (name, `rows`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `rows` = VALUES(`rows`), updated_at = NOW()",
          ["products", JSON.stringify(products)]
        );

        await conn.commit();
        console.log("MySQL collections updated successfully.");
      } finally {
        conn.release();
        await pool.end();
      }
    } catch (err) {
      console.warn("Error updating MySQL:", err.message);
    }
  }

  // 2. Update data/products.json
  const dataPath = path.join(process.cwd(), "data", "products.json");
  if (existsSync(dataPath)) {
    try {
      const raw = await readFile(dataPath, "utf8");
      const products = JSON.parse(raw);
      const idx = products.findIndex((p) => p.id === testProduct.id || p.slug === testProduct.slug);
      if (idx >= 0) {
        products[idx] = { ...products[idx], ...testProduct, updatedAt: new Date().toISOString() };
      } else {
        products.unshift(testProduct);
      }
      await writeFile(dataPath, JSON.stringify(products, null, 2), "utf8");
      console.log("Updated data/products.json successfully.");
    } catch (err) {
      console.warn("Error updating data/products.json:", err.message);
    }
  }

  // 3. Update data/seed/products.json
  const seedPath = path.join(process.cwd(), "data", "seed", "products.json");
  if (existsSync(seedPath)) {
    try {
      const raw = await readFile(seedPath, "utf8");
      const products = JSON.parse(raw);
      const idx = products.findIndex((p) => p.id === testProduct.id || p.slug === testProduct.slug);
      if (idx >= 0) {
        products[idx] = { ...products[idx], ...testProduct, updatedAt: new Date().toISOString() };
      } else {
        products.unshift(testProduct);
      }
      await writeFile(seedPath, JSON.stringify(products, null, 2), "utf8");
      console.log("Updated data/seed/products.json successfully.");
    } catch (err) {
      console.warn("Error updating data/seed/products.json:", err.message);
    }
  }

  console.log("\nDone! Test product created with price ₹1 (100 paise) and freeShipping (no addons).");
}

main().catch(console.error);
