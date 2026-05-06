import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const uri = process.env.MONGO_URI;
console.log("Testing with native MongoClient + tls=true...");

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 15000,
  tls: true,
});

try {
  await client.connect();
  const admin = client.db().admin();
  const info = await admin.serverStatus();
  console.log("OK connected. host:", info.host);
  await client.close();
  process.exit(0);
} catch (err) {
  console.error("FAIL:", err?.message);
  console.error("Name:", err?.name, "code:", err?.code, "codeName:", err?.codeName);
  if (err?.cause) console.error("Cause:", err.cause?.message);
  process.exit(1);
}
