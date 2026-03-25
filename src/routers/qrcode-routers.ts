import express from "express";
import {
  generateQRCode,
  getAllQRCodes,
  getQRCodeById,
  redirectToOriginalUrl,
  updateQRCode,
  deleteQRCode,
} from "../Controllers/qrcode-controller";

const router = express.Router();


router.post("/generate", generateQRCode);
router.get("/", getAllQRCodes);
router.get("/:id", getQRCodeById);
router.put("/:id", updateQRCode);
router.get("/r/:code", redirectToOriginalUrl);
router.delete("/:id", deleteQRCode);

export default router;