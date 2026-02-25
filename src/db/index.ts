import mongoose from "mongoose";
import { db_name } from "../constants";

export const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI as string}/${db_name}`);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ DB Error:", error);
    process.exit(1);
    console.log("MONGO_URI:", process.env.MONGO_URI);
  }
};