import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const uri = process.env.DATABASE_URL;

async function testConnection() {
  console.log("--- DB Connection Test ---");
  if (!uri) {
    console.error("ERROR: DATABASE_URL is not defined in .env.local");
    process.exit(1);
  }

  const maskedUri = uri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
  console.log(`Connecting to: ${maskedUri}...`);
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("SUCCESS: Connected to database");
    console.log(`Database name: ${conn.connection.name}`);
    await mongoose.disconnect();
    console.log("Disconnected");
  } catch (error: any) {
    console.error("FAILED: Connection error details:");
    console.error(error.message);
    if (error.reason) {
      console.error("Reason:", JSON.stringify(error.reason, null, 2));
    }
  }
}

testConnection();
