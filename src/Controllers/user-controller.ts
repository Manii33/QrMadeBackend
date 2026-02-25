import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user-models";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/AccessTokenAndRefreshToken";
import { generateQR } from "../utils/qr";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { validationResult } from "express-validator";

export const signup = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.status(201).json({
      message: "User registered successfully",
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed" });
  }
}; 

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.json({ user, accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

// FORGET PASSWORD
export const forgetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      text: `Reset link: http://localhost:5173/reset-password/${resetToken}`,
    });

    res.json({ message: "Reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Error sending email" });
  }
};

// GENERATE QR
export const generateUserQR = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    const qr = await generateQR(data);

    res.json({ qr });
  } catch (error) {
    res.status(500).json({ message: "QR generation failed" });
  }
};