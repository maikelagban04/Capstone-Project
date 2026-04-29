import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendWelcomeEmail } from "../utils/emailService.js";

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

  const existingUser = await User.findOne({ email: email.toLowerCase() });

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

  const authPayload = buildAuthResponse(req.user);
  const redirectUrl = new URL("/oauth-success", process.env.CLIENT_URL || "http://localhost:5173");
  redirectUrl.searchParams.set("token", authPayload.token);

  res.redirect(redirectUrl.toString());
};
