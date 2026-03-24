import express from "express";
import {
  generateQRCode,
  getAllQRCodes,
  getQRCodeById,
  updateQRCode,
  deleteQRCode,
} from "../Controllers/qrcode-controller";

const router = express.Router();


router.post("/generate", generateQRCode);
router.get("/", getAllQRCodes);
router.get("/:id", getQRCodeById);
router.put("/:id", updateQRCode);
router.delete("/:id", deleteQRCode);

export default router;