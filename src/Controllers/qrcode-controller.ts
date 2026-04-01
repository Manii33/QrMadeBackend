import { Request, Response } from "express";
import { QRCode } from "../models/qrcode-model";
import { nanoid } from "nanoid";
import mongoose from "mongoose";
import QRCodeLib from 'qrcode';


export const generateQRCode = async (req: Request, res: Response) => {
  try {
    const { title, originalUrl, userId } = req.body;
    const shortCode = nanoid(6);

    const qrData = await QRCode.create({
      title: title || "My QR",
      originalUrl,
      shortCode,
      userId: userId || new mongoose.Types.ObjectId(),
    });

    
    const myIP = "192.168.10.245"; 
    const qrLink = `http://${myIP}:5000/api/qr/r/${shortCode}`;

    const qrImageBase64 = await QRCodeLib.toDataURL(qrLink, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300
    });

    res.status(201).json({
      success: true,
      message: "QR Code generated successfully",
      data: {
        qrCode: qrImageBase64, // 👈 Ab ye image foran load hogi
        shortLink: qrLink,
        ...qrData.toObject(),
      },
    });

  } catch (error) {
    console.log("QR Generation Error:", error);
    res.status(500).json({ message: "Error generating QR code" });
  }
};


export const getAllQRCodes = async (req: Request, res: Response) => {
  try {
    const qrCodes = await QRCode.find().populate("userId");

    res.status(200).json(qrCodes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching QR codes" });
  }
};


export const getQRCodeById = async (req: Request, res: Response) => {
  try {
    const qr = await QRCode.findById(req.params.id).populate("userId");

    if (!qr) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    res.status(200).json(qr);
  } catch (error) {
    res.status(500).json({ message: "Error fetching QR code" });
  }
};


export const updateQRCode = async (req: Request, res: Response) => {
  try {
    const { title, originalUrl, isActive } = req.body;

    const updatedQR = await QRCode.findByIdAndUpdate(
      req.params.id,
      { title, originalUrl, isActive },
      { new: true }
    );

    if (!updatedQR) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    res.status(200).json({
      message: "QR Code updated successfully",
      data: updatedQR,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating QR code" });
  }
};


export const deleteQRCode = async (req: Request, res: Response) => {
  try {
    const deletedQR = await QRCode.findByIdAndDelete(req.params.id);

    if (!deletedQR) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    res.status(200).json({
      message: "QR Code deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting QR code" });
  }
};

export const redirectToOriginalUrl = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const qr = await QRCode.findOne({ shortCode: code });

    if (!qr) {
      return res.status(404).send("QR not found");
    }

    const originalUrl = qr.originalUrl.startsWith("http") 
    ? qr.originalUrl 
    : `https://${qr.originalUrl}`;

return res.redirect(originalUrl);
  } catch (error) {
    console.log("Redirect Error:", error);
    return res.status(500).send("Server Error");
  }
};