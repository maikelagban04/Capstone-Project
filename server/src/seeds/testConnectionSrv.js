import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const original = process.env.MONGO_URI;
const match = original.match(/^mongodb:\/\/([^:]+):([^@]+)@/);
if (!match) {
  console.error("Cannot parse MONGO_URI");
  process.exit(1);
}
const [, user, pass] = match;
const srv = `mongodb+srv://${user}:${pass}@cluster0.g0d8imm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log("Trying SRV URI (creds masked):", srv.replace(/:([^@]+)@/, ":***@"));

try {
  await mongoose.connect(srv, { serverSelectionTimeoutMS: 15000 });
  console.log("OK connected. host=", mongoose.connection.host, "db=", mongoose.connection.name);
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.error("FAIL message:", err?.message);
  console.error("FAIL name:", err?.name);
  console.error("FAIL code:", err?.code);
  console.error("FAIL codeName:", err?.codeName);
  if (err?.reason?.servers) {
    for (const [host, desc] of err.reason.servers) {
      console.error(`  ${host} type=${desc?.type} err=${desc?.error?.message || "(none)"}`);
    }
  }
  process.exit(1);
}
