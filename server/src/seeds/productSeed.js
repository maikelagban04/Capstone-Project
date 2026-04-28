import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import { connectDatabase } from "../config/db.js";

dotenv.config();

const products = [
  // CPUs
  {
    title: "Intel Core i9-13900KS",
    description: "High-performance flagship processor with 24 cores for gaming and productivity",
    componentType: "CPU",
    brand: "Intel",
    model: "Core i9-13900KS",
    category: "Processors",
    priceBase: 690,
    markup: 15,
    image:
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=400&fit=crop",
    specifications: {
      cores: "24 cores / 32 threads",
      frequency: "6.0 GHz Turbo",
      power: "150W TDP",
    },
    compatibility: {
      socket: "LGA 1700",
      chipset: "Intel Z790",
    },
    stock: 15,
  },
  {
    title: "AMD Ryzen 7 5800X3D",
    description: "Excellent CPU for gaming with 3D V-Cache technology",
    componentType: "CPU",
    brand: "AMD",
    model: "Ryzen 7 5800X3D",
    category: "Processors",
    priceBase: 385,
    markup: 12,
    image:
      "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=400&fit=crop",
    specifications: {
      cores: "8 cores / 16 threads",
      frequency: "4.5 GHz Turbo",
      power: "105W TDP",
    },
    compatibility: {
      socket: "AM4",
      chipset: "AMD X570",
    },
    stock: 12,
  },

  // GPUs
  {
    title: "NVIDIA GeForce RTX 4090",
    description: "Ultimate gaming GPU with unmatched performance and DLSS 3 support",
    componentType: "GPU",
    brand: "NVIDIA",
    model: "GeForce RTX 4090",
    category: "Graphics Cards",
    priceBase: 1599,
    markup: 10,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    specifications: {
      memory: "24 GB GDDR6X",
      frequency: "2.52 GHz Boost",
      power: "450W TDP",
    },
    compatibility: {
      interface: "PCIe 4.0 x16",
      formFactor: "320mm Length",
    },
    stock: 8,
  },
  {
    title: "AMD Radeon RX 7900 XTX",
    description: "High-performance AMD graphics card for 4K gaming",
    componentType: "GPU",
    brand: "AMD",
    model: "Radeon RX 7900 XTX",
    category: "Graphics Cards",
    priceBase: 899,
    markup: 12,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    specifications: {
      memory: "24 GB GDDR6",
      frequency: "2.5 GHz Boost",
      power: "420W TDP",
    },
    compatibility: {
      interface: "PCIe 4.0 x16",
      formFactor: "312mm Length",
    },
    stock: 10,
  },

  // RAM
  {
    title: "Corsair Dominator Platinum RGB DDR5 32GB",
    description: "Premium DDR5 RAM with RGB lighting and excellent performance",
    componentType: "RAM",
    brand: "Corsair",
    model: "Dominator Platinum RGB DDR5 32GB",
    category: "Memory",
    priceBase: 245,
    markup: 18,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    specifications: {
      memory: "32 GB (2x16GB)",
      speed: "6000 MHz",
      power: "1.4V",
    },
    compatibility: {
      memoryType: "DDR5",
      formFactor: "DIMM",
    },
    stock: 25,
  },
  {
    title: "Kingston Fury Beast DDR4 32GB",
    description: "Reliable DDR4 RAM for gaming and productivity",
    componentType: "RAM",
    brand: "Kingston",
    model: "Fury Beast DDR4 32GB",
    category: "Memory",
    priceBase: 120,
    markup: 20,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    specifications: {
      memory: "32 GB (2x16GB)",
      speed: "3200 MHz",
      power: "1.35V",
    },
    compatibility: {
      memoryType: "DDR4",
      formFactor: "DIMM",
    },
    stock: 30,
  },

  // SSDs
  {
    title: "Samsung 990 Pro NVMe SSD 2TB",
    description: "Ultra-fast PCIe 4.0 NVMe SSD for maximum performance",
    componentType: "SSD",
    brand: "Samsung",
    model: "990 Pro 2TB",
    category: "Storage",
    priceBase: 245,
    markup: 15,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    specifications: {
      capacity: "2 TB",
      speed: "7100 MB/s Read",
      power: "7.5W",
    },
    compatibility: {
      formFactor: "M.2 2280",
      interface: "NVMe PCIe 4.0",
    },
    stock: 18,
  },
  {
    title: "WD_BLACK SN850X NVMe SSD 1TB",
    description: "High-speed gaming NVMe SSD with excellent reliability",
    componentType: "SSD",
    brand: "Western Digital",
    model: "WD_BLACK SN850X 1TB",
    category: "Storage",
    priceBase: 115,
    markup: 16,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    specifications: {
      capacity: "1 TB",
      speed: "7100 MB/s Read",
      power: "6.8W",
    },
    compatibility: {
      formFactor: "M.2 2280",
      interface: "NVMe PCIe 4.0",
    },
    stock: 20,
  },

  // Motherboards
  {
    title: "ASUS ROG STRIX Z790-E Gaming WIFI",
    description: "Premium Intel Z790 motherboard with advanced features for gaming",
    componentType: "Motherboard",
    brand: "ASUS",
    model: "ROG STRIX Z790-E",
    category: "Motherboards",
    priceBase: 389,
    markup: 14,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    specifications: {
      details: {
        "Power Delivery": "18+2+1 Phases",
        "Memory Support": "DDR5 up to 7800+",
      },
    },
    compatibility: {
      socket: "LGA 1700",
      chipset: "Intel Z790",
      memoryType: "DDR5",
    },
    stock: 12,
  },
  {
    title: "MSI MPG B850 Edge WIFI",
    description: "Excellent AMD B850 motherboard for Ryzen 7000 processors",
    componentType: "Motherboard",
    brand: "MSI",
    model: "MPG B850 Edge WIFI",
    category: "Motherboards",
    priceBase: 279,
    markup: 13,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    specifications: {
      details: {
        "Power Delivery": "18+2+1 Phases",
        "Memory Support": "DDR5 up to 7600+",
      },
    },
    compatibility: {
      socket: "AM5",
      chipset: "AMD B850",
      memoryType: "DDR5",
    },
    stock: 14,
  },

  // Power Supplies
  {
    title: "Corsair RM1000e 1000W Gold",
    description: "Reliable 1000W Gold-rated modular power supply",
    componentType: "PSU",
    brand: "Corsair",
    model: "RM1000e 1000W",
    category: "Power Supplies",
    priceBase: 199,
    markup: 17,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    specifications: {
      power: "1000W",
      efficiency: "80+ Gold",
    },
    compatibility: {
      wattage: "1000W",
      formFactor: "ATX",
    },
    stock: 16,
  },
  {
    title: "EVGA SuperNOVA 850W Gold",
    description: "High-quality 850W Gold power supply for gaming systems",
    componentType: "PSU",
    brand: "EVGA",
    model: "SuperNOVA 850W G6",
    category: "Power Supplies",
    priceBase: 149,
    markup: 18,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    specifications: {
      power: "850W",
      efficiency: "80+ Gold",
    },
    compatibility: {
      wattage: "850W",
      formFactor: "ATX",
    },
    stock: 19,
  },

  // Cases
  {
    title: "Lian Li LANCOOL 3 Mesh",
    description: "Modern ATX case with excellent airflow and cable management",
    componentType: "Case",
    brand: "Lian Li",
    model: "LANCOOL 3 Mesh",
    category: "Cases",
    priceBase: 89,
    markup: 20,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    specifications: {
      details: {
        "Motherboard Support": "E-ATX, ATX, Micro-ATX, Mini-ITX",
        "GPU Length": "Up to 420mm",
      },
    },
    compatibility: {
      formFactor: "ATX",
    },
    stock: 22,
  },
  {
    title: "Corsair 5000T RGB",
    description: "Premium full-size case with RGB lighting and tempered glass",
    componentType: "Case",
    brand: "Corsair",
    model: "5000T RGB",
    category: "Cases",
    priceBase: 299,
    markup: 15,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    specifications: {
      details: {
        "Motherboard Support": "E-ATX, ATX, Micro-ATX",
        "Cooling Support": "Up to 420mm radiator",
      },
    },
    compatibility: {
      formFactor: "ATX",
    },
    stock: 11,
  },

  // CPU Coolers
  {
    title: "Noctua NH-D15 Chromax",
    description: "High-performance air cooler with excellent cooling capability",
    componentType: "Cooling",
    brand: "Noctua",
    model: "NH-D15 Chromax",
    category: "Cooling",
    priceBase: 99,
    markup: 19,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    specifications: {
      power: "150W TDP",
    },
    compatibility: {
      socket: "LGA 1700, AM5",
    },
    stock: 13,
  },
  {
    title: "CORSAIR H150i ELITE CAPELLIX",
    description: "360mm all-in-one liquid cooler with RGB lighting",
    componentType: "Cooling",
    brand: "Corsair",
    model: "H150i ELITE CAPELLIX",
    category: "Cooling",
    priceBase: 179,
    markup: 16,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    specifications: {
      power: "250W TDP",
    },
    compatibility: {
      socket: "LGA 1700, AM5",
    },
    stock: 9,
  },

  // Monitors
  {
    title: "LG 27GN950-B UltraGear Gaming Monitor",
    description: "27-inch 4K 144Hz gaming monitor with USB-C",
    componentType: "Monitor",
    brand: "LG",
    model: "27GN950-B",
    category: "Monitors",
    priceBase: 999,
    markup: 12,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    specifications: {
      details: {
        Resolution: "3840 x 2160 (4K)",
        "Refresh Rate": "144 Hz",
        "Response Time": "1ms",
      },
    },
    compatibility: {
      interface: "DisplayPort 1.4, HDMI 2.1",
    },
    stock: 7,
  },
  {
    title: "ASUS ROG PG279QM Gaming Monitor",
    description: "27-inch 1440p 240Hz IPS gaming monitor",
    componentType: "Monitor",
    brand: "ASUS",
    model: "ROG PG279QM",
    category: "Monitors",
    priceBase: 799,
    markup: 14,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    specifications: {
      details: {
        Resolution: "2560 x 1440 (QHD)",
        "Refresh Rate": "240 Hz",
        "Response Time": "1ms",
      },
    },
    compatibility: {
      interface: "DisplayPort 1.4, HDMI 2.0",
    },
    stock: 8,
  },
];

async function seedDatabase() {
  try {
    await connectDatabase();
    console.log("Connected to database");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(`Successfully seeded ${insertedProducts.length} products`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
