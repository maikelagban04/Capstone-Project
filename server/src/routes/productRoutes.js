import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
  updateProductInventory,
  getFilterOptions,
} from "../controllers/productController.js";
import { adminOnly, protect, superAdminOnly } from "../middleware/authMiddleware.js";
import { upload, handleUploadError } from "../middleware/uploadMiddleware.js";

const router = Router();

router.get("/filters", getFilterOptions);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/upload", protect, adminOnly, upload.single("image"), handleUploadError, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json({
    message: "Image uploaded successfully",
    imageUrl: req.file.path,
    publicId: req.file.filename,
  });
});
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.patch("/:id/inventory", protect, superAdminOnly, updateProductInventory);
router.delete("/:id", protect, superAdminOnly, deleteProduct);

export default router;
