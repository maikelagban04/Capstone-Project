import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configura lo storage di Multer per Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "dropship-store-pro",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    max_file_size: 5 * 1024 * 1024, // 5MB
  },
});

// Configurazione multer con validazione
export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo immagini sono consentite (JPEG, PNG, GIF, WebP)"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Middleware per gestire errori di upload
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File troppo grande. Massimo 5MB",
      });
    }
    return res.status(400).json({
      message: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      message: err.message,
    });
  }
  next();
};
