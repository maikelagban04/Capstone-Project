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
    specifications: {
      // Specifiche tecniche generiche per tutti i componenti
      cores: String,
      frequency: String,
      memory: String,
      speed: String,
      capacity: String,
      power: String,
      details: {
        type: Map,
        of: String,
        default: {},
      },
    },
    compatibility: {
      socket: String,
      chipset: String,
      interface: String,
      formFactor: String,
      memoryType: String,
      wattage: String,
      tdp: String,
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
