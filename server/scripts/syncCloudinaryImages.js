/* eslint-disable no-console */
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// CONFIG --------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Imposta a stringa vuota "" per cercare in root, oppure es. "products" per
// limitare a una cartella. Gli asset di "samples/" (demo Cloudinary) vengono
// sempre esclusi.
const FOLDER = "";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_FILE = path.resolve(__dirname, "../src/seeds/productSeed.js");
const OUT_JSON = path.resolve(__dirname, "../src/seeds/productImages.json");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ---------------------------------------------------------------------------
// UTILS ---------------------------------------------------------------------
// ---------------------------------------------------------------------------
const normalize = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

// Cloudinary aggiunge un suffisso di 6 caratteri lowercase tipo "_ftmbgt"
// quando il public_id non è univoco. Lo strippiamo per il match.
const stripCloudinarySuffix = (basename) =>
  basename.replace(/_[a-z0-9]{6}$/, "");

// ---------------------------------------------------------------------------
// PARSE TITLES + BRAND/MODEL DAL SEED ---------------------------------------
// ---------------------------------------------------------------------------
async function parseSeedProducts() {
  const text = await fs.readFile(SEED_FILE, "utf8");
  // Match each "make({ ... })" block (non-greedy, but balance parens manually)
  const products = [];
  const makeRegex = /make\(\{([\s\S]*?)\n\s*\}\)/g;
  let match;
  while ((match = makeRegex.exec(text)) !== null) {
    const block = match[1];
    const title = block.match(/title:\s*"([^"]+)"/)?.[1];
    const brand = block.match(/brand:\s*"([^"]+)"/)?.[1];
    const model = block.match(/model:\s*"([^"]+)"/)?.[1];
    if (title && brand && model) {
      products.push({ title, brand, model });
    }
  }
  return products;
}

// ---------------------------------------------------------------------------
// LIST CLOUDINARY -----------------------------------------------------------
// ---------------------------------------------------------------------------
async function listCloudinaryAssets(folder) {
  const all = [];
  let nextCursor = null;
  do {
    const params = {
      type: "upload",
      max_results: 500,
      next_cursor: nextCursor || undefined,
    };
    if (folder) params.prefix = `${folder}/`;
    const res = await cloudinary.api.resources(params);
    all.push(...res.resources);
    nextCursor = res.next_cursor;
  } while (nextCursor);
  // Escludi i sample asset di Cloudinary
  return all.filter((a) => !a.public_id.startsWith("samples/"));
}

// ---------------------------------------------------------------------------
// MATCH ---------------------------------------------------------------------
// ---------------------------------------------------------------------------
function buildAssetIndex(assets) {
  // Index: normalizedKey -> secure_url
  const index = new Map();
  for (const asset of assets) {
    const id = asset.public_id; // es. "kyron/AMD_Ryzen_9_7950X3D_ftmbgt"
    const basename = id.split("/").pop();
    const stripped = stripCloudinarySuffix(basename);
    const keys = new Set([normalize(basename), normalize(stripped)]);
    for (const k of keys) {
      if (k && !index.has(k)) index.set(k, asset.secure_url);
    }
  }
  return index;
}

function matchProductToAsset(product, index) {
  const candidates = [
    `${product.brand} ${product.model}`,
    product.title,
    product.model,
  ].map(normalize);
  for (const key of candidates) {
    if (index.has(key)) return index.get(key);
  }
  // fuzzy: trova chiave dell'index che inizia col candidato (o viceversa)
  for (const key of candidates) {
    for (const [indexKey, url] of index) {
      if (indexKey.startsWith(key) || key.startsWith(indexKey)) return url;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// MAIN ----------------------------------------------------------------------
// ---------------------------------------------------------------------------
async function main() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.error("❌ Cloudinary credentials missing in .env");
    process.exit(1);
  }

  console.log(`📂 Listing Cloudinary folder "${FOLDER}/"...`);
  const assets = await listCloudinaryAssets(FOLDER);
  console.log(`   Found ${assets.length} assets`);

  console.log(`📖 Parsing products from seed...`);
  const products = await parseSeedProducts();
  console.log(`   Found ${products.length} products`);

  const index = buildAssetIndex(assets);
  const map = {};
  const unmatched = [];

  for (const p of products) {
    const url = matchProductToAsset(p, index);
    if (url) map[p.title] = url;
    else unmatched.push(p);
  }

  await fs.writeFile(OUT_JSON, JSON.stringify(map, null, 2), "utf8");

  console.log(`\n✅ Matched: ${Object.keys(map).length}/${products.length}`);
  console.log(`   Saved to ${path.relative(process.cwd(), OUT_JSON)}`);

  if (unmatched.length) {
    console.log(`\n⚠️  Unmatched (${unmatched.length}):`);
    for (const p of unmatched) {
      const expected = normalize(`${p.brand} ${p.model}`);
      console.log(`   - "${p.title}"  (expected slug: ${expected})`);
    }
    console.log(
      `\n💡 Rinomina i file mancanti su Cloudinary in modo che il public_id (parte prima del suffisso) corrisponda a brand+model.`
    );
  }
}

main().catch((err) => {
  console.error("FAIL:", err?.message || err);
  process.exit(1);
});
