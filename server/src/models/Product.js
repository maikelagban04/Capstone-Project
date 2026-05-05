import mongoose from "mongoose";
import { calculateFinalPrice } from "../utils/calculateFinalPrice.js";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    priceBase: {
      type: Number,
      required: true,
      min: 0,
    },
    markup: {
      type: Number,
      required: true,
      min: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    componentType: {
      type: String,
      enum: [
        "CPU",
        "GPU",
        "RAM",
        "SSD",
        "HDD",
        "Motherboard",
        "PSU",
        "Case",
        "Cooling",
        "Monitor",
        "Storage",
        "Accessory",
      ],
      required: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    // === Campi commerciali / descrittivi universali ===
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    highlights: {
      type: [{ type: String, trim: true, maxlength: 160 }],
      default: [],
    },
    images: {
      // Galleria immagini (Cloudinary URL). Il campo `image` resta come
      // copertina / fallback per liste e card.
      type: [{ type: String, trim: true }],
      default: [],
    },
    releaseYear: {
      type: Number,
      min: 1990,
      max: 2100,
    },
    warrantyMonths: {
      type: Number,
      min: 0,
      default: 24,
    },
    weightGrams: {
      type: Number,
      min: 0,
    },
    dimensionsMm: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    color: {
      type: String,
      trim: true,
    },

    // === Specifiche tecniche ===
    specifications: {
      // Specifiche generiche condivise (back-compat: i seed esistenti
      // continuano a funzionare leggendo questi campi flat).
      cores: String,
      frequency: String,
      memory: String,
      speed: String,
      capacity: String,
      power: String,

      // Sotto-oggetti opzionali per ogni componentType.
      // Vengono valorizzati solo per il tipo corrispondente; il frontend
      // mostra solo il gruppo del componentType del prodotto.
      cpu: {
        architecture: String,        // "Zen 4", "Raptor Lake"
        coresCount: Number,
        threadsCount: Number,
        baseClockGhz: Number,
        boostClockGhz: Number,
        cacheL3Mb: Number,
        processNm: Number,
        integratedGpu: String,
      },
      gpu: {
        vramGb: Number,
        vramType: String,            // "GDDR6X"
        boostClockMhz: Number,
        cudaCores: Number,
        rayTracingCores: Number,
        tdpW: Number,
        lengthMm: Number,
        ports: [String],
        recommendedPsuW: Number,
      },
      ram: {
        sizeGb: Number,
        modulesCount: Number,
        speedMhz: Number,
        casLatency: Number,
        voltage: Number,
        rgb: Boolean,
      },
      ssd: {
        capacityGb: Number,
        interface: String,           // "NVMe PCIe 4.0", "SATA III"
        readMbS: Number,
        writeMbS: Number,
        tbw: Number,
        controller: String,
        nandType: String,            // "TLC", "QLC"
        dramCache: Boolean,
      },
      psu: {
        wattage: Number,
        efficiencyRating: String,    // "80+ Gold", "80+ Platinum"
        modular: { type: String, enum: ["Full", "Semi", "No", null], default: null },
        fanSizeMm: Number,
        atxVersion: String,
        pcie5Connector: Boolean,
      },
      motherboard: {
        chipset: String,
        memorySlots: Number,
        maxMemoryGb: Number,
        pcieVersion: String,         // "5.0"
        m2Slots: Number,
        sataPorts: Number,
        wifi: Boolean,
        bluetooth: Boolean,
      },
      case: {
        formFactorSupport: [String], // ["ATX", "mATX", "ITX"]
        maxGpuLengthMm: Number,
        maxCoolerHeightMm: Number,
        fanSlotsIncluded: Number,
        radiatorSupport: [String],   // ["240", "280", "360"]
        sidePanel: String,
      },
      cooling: {
        type: { type: String, enum: ["Air", "AIO", "Custom", null], default: null },
        radiatorSizeMm: Number,
        fanCount: Number,
        maxFanRpm: Number,
        noiseDbA: Number,
        supportedSockets: [String],
      },

      // Fallback libero (back-compat).
      details: {
        type: Map,
        of: String,
        default: {},
      },
    },

    // === Compatibilità ===
    compatibility: {
      socket: String,
      chipset: String,
      interface: String,
      formFactor: String,             // "ATX", "mATX", "ITX" (per mobo)
      memoryType: String,             // "DDR4", "DDR5"
      wattage: String,
      tdp: String,
      // Estensioni per check più precisi
      pciExpressVersion: String,
      memorySlots: Number,
      maxMemoryGb: Number,
      maxGpuLengthMm: Number,
      efficiencyRating: String,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: false,
      index: true,
    },
    isOnSale: {
      type: Boolean,
      default: false,
      index: true,
    },
    salePrice: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre("validate", function syncFinalPrice(next) {
  this.finalPrice = calculateFinalPrice(this.priceBase, this.markup);
  const numericStock = Number.isFinite(this.stock) ? this.stock : 0;
  this.inStock = numericStock > 0;
  if (!this.isOnSale || !Number.isFinite(this.salePrice) || this.salePrice <= 0) {
    this.salePrice = null;
    this.isOnSale = false;
  } else if (this.salePrice >= this.finalPrice) {
    // Sale price must be strictly lower than the regular price
    this.salePrice = null;
    this.isOnSale = false;
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
