import { Request, Response,NextFunction  } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user-model";
import { generateAccessTokenAndRefreshToken } from "../utils/generateAccessTokenAndRefreshToken";
import { generateQR } from "../utils/qr";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { email, password } = req.body;

        // Check karo ke sab fields filled hain
        if ([email, password].some((field) => !field?.trim())) {
            return res.status(400).json({ status: 400, message: "Sab fields required hain" });
        }

        // User create karo
        const user = await User.create({ email, password });

        // Tokens generate karo
        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id.toString());

        // Refresh token DB mein save karo
        user.refreshToken = refreshToken;
        await user.save();

        // Tokens cookies mein bhejo
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 din
        }).cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const response = await User.findById(user._id).select("-password -__v");

        return res.status(200).json({ status: 200, message: "User registered successfully", data: response });
    } catch (error) {
        return next(error);
    }
};

// LOGIN
export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: 400, message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if(!isPasswordValid){
            return res.status(401).json({ status: 401, message: "Invalid credentials"});
        }

        const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id.toString());

      const loggedInUser = await User.findById(user._id).select("-password -__v");

      res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

    return res.status(200).json({
      status: 200,
      message: "Login successful",
      data: loggedInUser,
    });

  } catch (error) {
    return next(error);
  }
};

// FORGET PASSWORD
export const forgetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign(
  { id: user._id },
  process.env.JWT_ACCESS_TOKEN_SECRET!,
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
      text: `Reset link: http://localhost:3000/forgot-password/${resetToken}`,
    });

    res.status(200).json({ message: "Reset email sent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error sending email" });
  }
};

// GENERATE QR
export const generateUserQR = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    const qr = await generateQR(data);

    res.status(200).json({ status: 200, data: { qr } });
  } catch (error) {
    res.status(500).json({ message: "QR generation failed" });
  }
};