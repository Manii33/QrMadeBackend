import { Request, Response } from "express";
import { QRCode } from "../models/qrcode-model";
import { nanoid } from "nanoid";


export const generateQRCode = async (req: Request, res: Response) => {
  try {
    const { title, originalUrl, userId } = req.body;

    if (!title || !originalUrl) {
      return res.status(400).json({ message: "Title and URL are required" });
    }

    const shortCode = nanoid(6);

    const qr = await QRCode.create({
      title,
      originalUrl,
      shortCode,
      // Only include userId if provided
      ...(userId && { userId }),
    });

    res.status(201).json({
      message: "QR Code generated successfully",
      data: qr,
    });
  } catch (error) {
    console.error("QR Generation Error:", error);
    res.status(500).json({ message: "Error generating QR code", error });
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