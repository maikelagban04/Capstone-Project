import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/generateToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendWelcomeEmail } from "../utils/emailService.js";
import { getSuperAdminEmail } from "../middleware/authMiddleware.js";

export const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || "",
  authProvider: user.authProvider,
  token: generateToken({ id: user._id, role: user.role }),
});

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Guard anti-squatting: l'email del super admin è riservata e non può essere
  // registrata tramite signup pubblico. Il record viene creato solo via seed.
  if (normalizedEmail === getSuperAdminEmail()) {
    return res.status(403).json({ message: "This email is reserved" });
  }

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  sendWelcomeEmail(user);

  res.status(201).json(buildAuthResponse(user));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (user && !user.password) {
    return res
      .status(400)
      .json({ message: "This account uses Google sign-in. Continue with Google instead." });
  }

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json(buildAuthResponse(user));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

export const handleGoogleAuthSuccess = (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=google_auth_failed`);
  }

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const redirectUrl = new URL("/oauth-success", clientUrl);

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.redirect(`${clientUrl}/login?error=missing_jwt_secret`);
  }

  // Use a short-lived JWT for OAuth completion (NOT the long-lived auth token).
  const oauthCodeJwt = jwt.sign(
    { purpose: "oauth_complete", userId: req.user._id.toString() },
    secret,
    { expiresIn: "5m" }
  );

  redirectUrl.searchParams.set("code", oauthCodeJwt);
  res.redirect(redirectUrl.toString());
};

export const completeOAuthLogin = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "OAuth code is required" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "JWT_SECRET is not defined" });
  }

  let decoded;
  try {
    decoded = jwt.verify(code, secret);
  } catch (_error) {
    return res.status(400).json({ message: "Invalid or expired OAuth code" });
  }

  if (!decoded || decoded.purpose !== "oauth_complete" || !decoded.userId) {
    return res.status(400).json({ message: "Invalid or expired OAuth code" });
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  res.json(buildAuthResponse(user));
});
