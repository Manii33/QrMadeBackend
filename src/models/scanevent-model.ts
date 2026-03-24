import mongoose from "mongoose";


const scanEventSchema = new mongoose.Schema({
  qrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QRCode",
    required: true,
  },

  ipAddress: {
    type: String,
  },

  country: {
    type: String,
    required : true,
  },

  city: {
    type: String,
    required : true,
  },

  deviceType: {
    type: String,
    required : true,
  },

  browser: {
    type: String,
  },

  os: {
    type: String,
    required : true,
  },

  userAgent: {
    type: String,
  },

  scannedAt: {
    type: Date,
    default: Date.now,
  },
});

export const ScanEvent = mongoose.model("ScanEvent", scanEventSchema);