import express from "express";
import { createScanEvent, getScansByQrId } from "../Controllers/scanevent-controller";

const router = express.Router();

router.post("/scan", createScanEvent);
router.get("/scan/:qrId", getScansByQrId);

export default router;