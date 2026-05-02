import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  const token = authHeader.split(" ")[1];
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return res.status(401).json({ message: "Not authorized, user not found" });
  }

  req.user = user;
  next();
});

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

const SUPER_ADMIN_FALLBACK = "maikelagban04@gmail.com";

export const getSuperAdminEmail = () =>
  (process.env.SUPER_ADMIN_EMAIL || SUPER_ADMIN_FALLBACK).trim().toLowerCase();

export const superAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  const userEmail = (req.user.email || "").trim().toLowerCase();
  if (userEmail !== getSuperAdminEmail()) {
    return res.status(403).json({ message: "Super admin access required" });
  }

  next();
};
