import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { hasSmtpConfig } from "./utils/emailService.js";
import { hasSendGridConfig, getMailFrom } from "./utils/sendgridMail.js";

dotenv.config();

const app = express();

const defaultAllowedOrigins = ["http://localhost:5173", "http://localhost:3000"];
const envAllowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...envAllowedOrigins, ...defaultAllowedOrigins])];
const allowVercelOrigins = process.env.CORS_ALLOW_VERCEL_APP === "true";

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (no Origin header), e.g. curl/Postman
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (allowVercelOrigins) {
        try {
          const hostname = new URL(origin).hostname;
          if (hostname.endsWith(".vercel.app")) return callback(null, true);
        } catch (_error) {
          // ignore invalid origin parsing
        }
      }
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());

app.get("/api/health", (req, res) => {
  const mailFrom = getMailFrom();
  res.json({
    message: "Dropship Store Pro API is running",
    smtpConfigured: hasSmtpConfig(),
    sendgridConfigured: hasSendGridConfig(),
    mailFromConfigured: Boolean(mailFrom?.email),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/products", productRoutes); // fallback alias for legacy or misconfigured frontend URLs
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
