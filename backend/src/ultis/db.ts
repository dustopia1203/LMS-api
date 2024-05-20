import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const db_url: string = process.env.DB_URL || "";

async function connect(): Promise<void> {
  try {
    await mongoose.connect(db_url);
    console.log("Database connected successfully!");
  } catch (e) {
    console.log("Connect failed\n" + e);
  }
}

export default { connect };