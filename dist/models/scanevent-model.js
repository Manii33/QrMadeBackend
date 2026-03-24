"use strict";
// models/scanEvent.model.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanEvent = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const scanEventSchema = new mongoose_1.default.Schema({
    qrId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "QRCode",
        required: true,
    },
    ipAddress: {
        type: String,
    },
    country: {
        type: String,
    },
    city: {
        type: String,
    },
    deviceType: {
        type: String,
    },
    browser: {
        type: String,
    },
    os: {
        type: String,
    },
    userAgent: {
        type: String,
    },
    scannedAt: {
        type: Date,
        default: Date.now,
    },
});
exports.ScanEvent = mongoose_1.default.model("ScanEvent", scanEventSchema);
