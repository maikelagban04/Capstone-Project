import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Ritorna la wishlist dell'utente autenticato, con i prodotti popolati.
export const getMyWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json(user?.wishlist || []);
});

// Aggiunge un prodotto alla wishlist (idempotente).
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // $addToSet evita duplicati anche sotto race condition.
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { wishlist: product._id },
  });

  const updated = await User.findById(req.user._id).populate("wishlist");
  res.json(updated.wishlist);
});

// Rimuove un prodotto dalla wishlist.
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { wishlist: productId },
  });

  const updated = await User.findById(req.user._id).populate("wishlist");
  res.json(updated.wishlist);
});
