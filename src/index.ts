import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./db";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});