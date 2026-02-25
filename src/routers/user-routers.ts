import express from "express";
import {
  signup,
  login,
  forgetPassword,
  generateUserQR,
} from "../Controllers/user-controller";
import { signupValidation } from "../middlewares/validation";


const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.post("/qr", generateUserQR);
router.post("/signup", signupValidation, signup);

export default router;