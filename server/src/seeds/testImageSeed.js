import dotenv from "dotenv";
import Product from "../models/Product.js";
import { connectDatabase } from "../config/db.js";

dotenv.config();

// Test seed: pulisce la collezione e inserisce un solo prodotto con immagine
// Cloudinary reale, per verificare che il flusso funzioni end-to-end
// (DB -> API -> frontend listing -> pagina dettaglio).

const TEST_IMAGE =
  "https://res.cloudinary.com/dub057kx0/image/upload/q_auto/f_auto/v1777993623/AMD_Ryzen_9_7950X3D_ftmbgt.jpg";

const testProduct = {
  title: "AMD Ryzen 9 7950X3D",
  shortDescription: "16 core Zen 4 con 3D V-Cache: il re del gaming AM5.",
  description:
    "L'ammiraglia AMD con tecnologia 3D V-Cache: 16 core Zen 4 a 5nm e 128 MB totali di cache L3 (di cui 64 MB impilati). Prestazioni gaming al top con consumi contenuti grazie ai 120W TDP.",
  highlights: [
    "16 core / 32 thread, boost 5.7 GHz",
    "128 MB L3 totali grazie al 3D V-Cache",
    "TDP 120W, efficienza imbattibile",
    "Socket AM5 con supporto DDR5 e PCIe 5.0",
  ],
  componentType: "CPU",
  brand: "AMD",
  model: "Ryzen 9 7950X3D",
  category: "Processors",
  priceBase: 689,
  markup: 12,
  isOnSale: false,
  salePrice: null,
  releaseYear: 2023,
  warrantyMonths: 36,
  stock: 15,
  inStock: true,
  image: TEST_IMAGE,
  images: [TEST_IMAGE],
  specifications: {
    cpu: {
      architecture: "Zen 4 (3D V-Cache)",
      coresCount: 16,
      threadsCount: 32,
      baseClockGhz: 4.2,
      boostClockGhz: 5.7,
      cacheL3Mb: 128,
      processNm: 5,
      integratedGpu: "Radeon Graphics 2-core",
    },
  },
  compatibility: { socket: "AM5", chipset: "AMD X670E", tdp: "120W" },
};

async function run() {
  try {
    await connectDatabase();
    console.log("Connected to database");

    await Product.deleteMany({});
    console.log("Cleared existing products");

    const inserted = await Product.create(testProduct);
    console.log(`Inserted test product: ${inserted.title} (id=${inserted._id})`);
    console.log(`Image URL: ${inserted.image}`);

    process.exit(0);
  } catch (error) {
    console.error("Error in test seed:", error);
    process.exit(1);
  }
}

run();
