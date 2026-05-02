import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import { connectDatabase } from "../config/db.js";
import { getSuperAdminEmail } from "../middleware/authMiddleware.js";

dotenv.config();

const seedSuperAdmin = async () => {
  const email = getSuperAdminEmail();
  const displayName = process.env.SUPER_ADMIN_NAME || "Maikel Agban";
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email) {
    throw new Error("SUPER_ADMIN_EMAIL is not configured");
  }
  if (!password || password.length < 6) {
    throw new Error(
      "SUPER_ADMIN_PASSWORD non impostato o troppo corto (min 6 caratteri). " +
        "Aggiungilo in server/.env e rilancia il seed.",
    );
  }

  await connectDatabase();
  console.log(`✔ Connected to MongoDB`);

  const existing = await User.findOne({ email });

  if (!existing) {
    // Il pre-save hook del User model si occupa di hashare la password.
    const created = await User.create({
      name: displayName,
      email,
      password,
      role: "admin",
      authProvider: "local",
    });
    console.log(`✔ Super admin creato: ${created.email} (id: ${created._id})`);
    console.log(`  → Login: vai su /login e usa email + password definita in SUPER_ADMIN_PASSWORD`);
  } else {
    // Re-imposta sempre password, ruolo e nome per garantire coerenza con .env.
    existing.name = displayName;
    existing.role = "admin";
    existing.authProvider = "local";
    existing.password = password; // verrà hashata dal pre-save hook
    await existing.save();
    console.log(`✔ Super admin aggiornato: ${existing.email} (id: ${existing._id})`);
    console.log("  role=admin, password sincronizzata con SUPER_ADMIN_PASSWORD");
  }
};

seedSuperAdmin()
  .then(() => mongoose.connection.close())
  .then(() => {
    console.log("✔ Seed completato");
    process.exit(0);
  })
  .catch((error) => {
    console.error("✘ Seed fallito:", error.message);
    mongoose.connection.close();
    process.exit(1);
  });
