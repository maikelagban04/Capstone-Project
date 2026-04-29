import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import { sendWelcomeEmail } from "../utils/emailService.js";

dotenv.config();

const upsertGoogleUser = async (profile) => {
  const email = profile.emails?.[0]?.value?.toLowerCase();
  const avatar = profile.photos?.[0]?.value || "";

  if (!email) {
    throw new Error("Google account email is required");
  }

  let user = await User.findOne({
    $or: [{ googleId: profile.id }, { email }],
  });

  if (!user) {
    user = await User.create({
      name: profile.displayName || email.split("@")[0],
      email,
      googleId: profile.id,
      avatar,
      authProvider: "google",
    });

    sendWelcomeEmail(user);

    return user;
  }

  user.googleId = user.googleId || profile.id;
  user.avatar = avatar || user.avatar;

  if (!user.password) {
    user.authProvider = "google";
  }

  await user.save();
  return user;
};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await upsertGoogleUser(profile);
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

export default passport;
