import { Request, Response, NextFunction } from "express";
import { ScanEvent } from "../models/scanevent-model";


// Scan Event
export const createScanEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {

    const { qrId, ipAddress, country, city, deviceType, browser, os, userAgent } = req.body;

    // validation
    if (!qrId || !country || !city || !deviceType || !os) {
      return res.status(400).json({
        message: "Required fields missing"
      });
    }

    // database
    const scan = await ScanEvent.create({
      qrId,
      ipAddress,
      country,
      city,
      deviceType,
      browser,
      os,
      userAgent
    });

    return res.status(201).json({
      message: "Scan event created successfully",
      data: scan
    });

  } catch (error) {
    next(error);
  }
};



//for specific QR
export const getScansByQrId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {

    const { qrId } = req.params;

    const scans = await ScanEvent.find({ qrId });

    return res.status(200).json({
      message: "QR scans fetched successfully",
      data: scans
    });

  } catch (error) {
    next(error);
  }
};