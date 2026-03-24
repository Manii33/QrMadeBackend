import express from "express";
import cors from "cors";
import userRoutes from "./routers/user-routers";
import qrRoutes from "./routers/qrcode-routers";
import scanRoutes from "./routers/scanevent-routes";
import cookieParser from "cookie-parser";



const app = express();

app.use(express.json());
app.use(cookieParser());


app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "Backend is working 🚀"
  });
});

app.use("/api/users", userRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/scan", scanRoutes);



export default app;