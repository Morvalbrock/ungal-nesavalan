import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.OUT_DIR || join(process.cwd(), "mobile-shots");
const LABEL = process.env.LABEL || "before";

const ROUTES = [
  ["home", "/"],
  ["products", "/products"],
  ["category-bridal", "/category/bridal-sarees"],
  ["category-silk", "/category/silk-sarees"],
  ["cart", "/cart"],
  ["checkout", "/checkout"],
  ["login", "/login"],
  ["register", "/register"],
  ["search", "/search"],
  ["journal", "/journal"],
  ["about", "/about"],
  ["contact", "/contact"],
  ["size-guide", "/size-guide"],
  ["care-guide", "/care-guide"],
  ["shipping-returns", "/shipping-returns"],
  ["privacy", "/privacy"],
  ["terms", "/terms"],
  ["account", "/account"],
  ["forgot-password", "/forgot-password"]
];

async function firstProductSlug() {
  try {
    const res = await fetch(`${BASE}/products`);
    const html = await res.text();
    const match = html.match(/href="\/products\/([a-z0-9-]+)"/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

const dir = join(OUT, LABEL);
await mkdir(dir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices["iPhone 14"],
  viewport: { width: 390, height: 844 }
});

const page = await context.newPage();
page.on("pageerror", (e) => console.error(`[pageerror]`, e.message));

const routes = [...ROUTES];
const slug = await firstProductSlug();
if (slug) routes.push(["product-detail", `/products/${slug}`]);

for (const [name, path] of routes) {
  const url = `${BASE}${path}`;
  try {
    const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    const status = resp?.status() ?? 0;
    await page.waitForTimeout(600);
    const file = join(dir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: process.env.FULL === "1" });
    console.log(`ok  ${status}  ${path}  -> ${file}`);
  } catch (e) {
    console.error(`err       ${path}  ${e.message}`);
  }
}

await browser.close();
console.log(`done -> ${dir}`);
