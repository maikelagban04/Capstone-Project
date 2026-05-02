import { Router } from "express";
import { getUsersWithStats, deleteOwnAccount } from "../controllers/userController.js";
import {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, adminOnly, getUsersWithStats);
router.delete("/me", protect, deleteOwnAccount);

router.get("/me/wishlist", protect, getMyWishlist);
router.post("/me/wishlist/:productId", protect, addToWishlist);
router.delete("/me/wishlist/:productId", protect, removeFromWishlist);

export default router;
