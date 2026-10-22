import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const PRODUCTS_PATH = path.resolve("./data/products.json");
const CATEGORIES_PATH = path.resolve("./data/categories.json");

const ALL_CRAFT_CLUSTERS = [
  { weave: "Kanchivaram", place: "Kanchipuram, TN", href: "/products?weave=kanchivaram" },
  { weave: "Aarani", place: "Aarani, TN", href: "/products?weave=aarani" },
  { weave: "Elampillai", place: "Elampillai, Salem", href: "/products?weave=elampillai" },
  { weave: "Banarasi", place: "Varanasi, UP", href: "/products?weave=banarasi" },
  { weave: "Chanderi", place: "Chanderi, MP", href: "/products?weave=chanderi" },
  { weave: "Patola", place: "Patan, Gujarat", href: "/products?weave=patola" },
  { weave: "Jamdani", place: "Uppada, AP", href: "/products?weave=jamdani" },
  { weave: "Ikat", place: "Pochampally / Sambalpur", href: "/products?weave=ikat" },
  { weave: "Paithani", place: "Paithan, Maharashtra", href: "/products?weave=paithani" },
  { weave: "Bandhani", place: "Kutch, Gujarat", href: "/products?weave=bandhani" },
  { weave: "Muga", place: "Sualkuchi, Assam", href: "/products?q=muga" },
  { weave: "Baluchari", place: "Bishnupur, WB", href: "/products?q=baluchari" }
];

function hasStock(p) {
  return Array.isArray(p.variants) && p.variants.some((v) => (Number(v.stock) || 0) > 0);
}

function getInStockCraftClusters(products) {
  const inStock = products.filter((p) => p.published && hasStock(p));
  return ALL_CRAFT_CLUSTERS.filter((c) => {
    const w = c.weave.toLowerCase();
    return inStock.some(
      (p) =>
        (p.weave && p.weave.toLowerCase() === w) ||
        (p.name && p.name.toLowerCase().includes(w))
    );
  });
}

function getAvailableFacets(products, categories) {
  const inStock = products.filter((p) => p.published && hasStock(p));

  const catMap = new Map();
  const weaveMap = new Map();
  const fabricMap = new Map();
  const occasionMap = new Map();

  for (const p of inStock) {
    if (p.categoryId) catMap.set(p.categoryId, (catMap.get(p.categoryId) ?? 0) + 1);
    if (p.weave) weaveMap.set(p.weave, (weaveMap.get(p.weave) ?? 0) + 1);
    if (p.fabric) fabricMap.set(p.fabric, (fabricMap.get(p.fabric) ?? 0) + 1);
    if (Array.isArray(p.occasion)) {
      for (const o of p.occasion) {
        occasionMap.set(o, (occasionMap.get(o) ?? 0) + 1);
      }
    }
  }

  const categoryFacets = categories
    .filter((c) => catMap.has(c.id))
    .map((c) => ({ id: c.id, label: c.name, count: catMap.get(c.id) }));

  return {
    categories: categoryFacets,
    weaves: Array.from(weaveMap.entries()).map(([k, count]) => ({ id: k, count })),
    fabrics: Array.from(fabricMap.entries()).map(([k, count]) => ({ id: k, count })),
    occasions: Array.from(occasionMap.entries()).map(([k, count]) => ({ id: k, count }))
  };
}

async function verify() {
  console.log("=== STARTING STOCK VERIFICATION TEST ===");

  const rawProducts = await readFile(PRODUCTS_PATH, "utf-8");
  const rawCategories = await readFile(CATEGORIES_PATH, "utf-8");

  const products = JSON.parse(rawProducts);
  const categories = JSON.parse(rawCategories);

  console.log(`Loaded ${products.length} products and ${categories.length} categories.`);

  // Baseline
  const initialInStock = products.filter((p) => p.published && hasStock(p));
  console.log(`Baseline in-stock products count: ${initialInStock.length}`);

  const initialClusters = getInStockCraftClusters(products);
  console.log(`Baseline craft clusters count: ${initialClusters.length}`);

  const initialFacets = getAvailableFacets(products, categories);
  console.log(`Baseline available weaves: ${initialFacets.weaves.map(w => w.id).join(", ")}`);

  // Target: Saree with weave 'patola'
  const patolaProduct = products.find((p) => p.weave === "patola");
  if (!patolaProduct) throw new Error("Patola saree not found in seed!");

  console.log(`\nSimulating out-of-stock for: "${patolaProduct.name}" (ID: ${patolaProduct.id})`);

  // Mutate memory copy to set stock = 0
  const modifiedProducts = products.map((p) => {
    if (p.id !== patolaProduct.id) return p;
    return {
      ...p,
      variants: p.variants.map((v) => ({ ...v, stock: 0 }))
    };
  });

  const modifiedInStock = modifiedProducts.filter((p) => p.published && hasStock(p));
  console.log(`Modified in-stock count: ${modifiedInStock.length} (Expected: ${initialInStock.length - 1})`);
  if (modifiedInStock.length !== initialInStock.length - 1) {
    throw new Error("Product was not correctly excluded when stock was set to 0!");
  }

  const modifiedClusters = getInStockCraftClusters(modifiedProducts);
  console.log(`Modified craft clusters count: ${modifiedClusters.length}`);
  const hasPatolaCluster = modifiedClusters.some((c) => c.weave.toLowerCase() === "patola");
  console.log(`Patola in Cartography of Craft: ${hasPatolaCluster} (Expected: false)`);
  if (hasPatolaCluster) {
    throw new Error("Patola was still shown in Cartography of Craft with 0 stock!");
  }

  const modifiedFacets = getAvailableFacets(modifiedProducts, categories);
  const hasPatolaWeaveFacet = modifiedFacets.weaves.some((w) => w.id.toLowerCase() === "patola");
  console.log(`Patola in Weave Filter Facets: ${hasPatolaWeaveFacet} (Expected: false)`);
  if (hasPatolaWeaveFacet) {
    throw new Error("Patola was still shown in Weave Filter with 0 stock!");
  }

  console.log("\n=== ALL TEST CONDITIONS VERIFIED SUCCESSFULLY! ===");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
