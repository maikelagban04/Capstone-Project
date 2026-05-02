import { Router } from "express";
import { getUsersWithStats, deleteOwnAccount } from "../controllers/userController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, adminOnly, getUsersWithStats);
router.delete("/me", protect, deleteOwnAccount);

export default router;
