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
  },
  {
    timestamps: true,
  }
);

productSchema.pre("validate", function syncFinalPrice(next) {
  this.finalPrice = calculateFinalPrice(this.priceBase, this.markup);
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
