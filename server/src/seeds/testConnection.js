import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const uri = process.env.MONGO_URI;
console.log("URI loaded:", uri ? "yes" : "no");
console.log(
  "URI shape:",
  uri ? uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@") : "n/a"
);

mongoose.set("debug", false);

try {
  console.log("Connecting...");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log("OK connected. Host:", mongoose.connection.host);
  console.log("DB name:", mongoose.connection.name);
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.error("FAIL:", err?.message || err);
  if (err?.reason?.servers) {
    for (const [host, desc] of err.reason.servers) {
      console.error(`  ${host}:`);
      console.error("    type:", desc?.type);
      console.error("    error:", desc?.error?.message || "(none)");
      console.error("    error.cause:", desc?.error?.cause?.message || "(none)");
      console.error("    error.code:", desc?.error?.code);
    }
  }
  console.error("Top error name:", err?.name);
  console.error("Top error code:", err?.code);
  console.error("Top error.cause:", err?.cause?.message);
  process.exit(1);
}
