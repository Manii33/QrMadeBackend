import express from "express";
import {
  signup,
  loginUser,
  forgetPassword,
  generateUserQR,
} from "../Controllers/user-controller";
import { signupValidation } from "../middlewares/validation";

const router = express.Router();

router.post("/signup", signupValidation, signup);
router.post("/login", loginUser);
router.post("/forgot-password", forgetPassword);
router.post("/qr", generateUserQR);

router.post("/test", (req, res) => {
  res.json({ message: "Test route working" });
});

export default router;