import express from "express";
import {
  signup,
  loginUser,
  sendForgotPasswordOtp, 
  verifyOtp, 
  resetPassword,
  generateUserQR,
} from "../Controllers/user-controller";
import { signupValidation } from "../middlewares/validation";

const router = express.Router();

router.post("/signup", signupValidation, signup);
router.post("/signin", loginUser);
router.post("/forgot-password", sendForgotPasswordOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/qr", generateUserQR);

router.post("/test", (req, res) => {
  res.json({ message: "Test route working" });
});

export default router;