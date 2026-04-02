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

        
        if ([email, password].some((field) => !field?.trim())) {
            return res.status(400).json({ status: 400, message: "Sab fields required hain" });
        }

        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                status: 400, 
                message: "User with this email already exists. Please login." 
            });
        }

        const user = await User.create({ email, password });

        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id.toString());

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
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
export const sendForgotPasswordOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 1 * 60 * 1000); 

    user.forgotPasswordOtp = otp;
    user.forgotPasswordOtpExpiry = expiry;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Password Reset",
      html: `<div style="font-family: Arial;"><h2>OTP: ${otp}</h2><p>Expires in 60 seconds.</p></div>`
    });

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 2. VERIFY OTP
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    
    // Debugging ke liye logs
    console.log("Input Check:", { email, otp });

    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Database Data:", {
      dbOtp: user.forgotPasswordOtp,
      dbExpiry: user.forgotPasswordOtpExpiry,
      currentTime: new Date()
    });

    // Match check karein
    const isOtpMatch = user.forgotPasswordOtp === otp;
    const isNotExpired = user.forgotPasswordOtpExpiry && user.forgotPasswordOtpExpiry > new Date();

    if (!isOtpMatch) {
        return res.status(400).json({ message: "OTP mismatch! DB mein kuch aur hai." });
    }

    if (!isNotExpired) {
        return res.status(400).json({ message: "OTP expired! Time nikal gaya." });
    }

    // Agar dono sahi hain
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '10m' });

    res.status(200).json({ success: true, message: "OTP Verified", resetToken });

  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};

// 3. RESET PASSWORD (Final Step)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword, resetToken } = req.body;
    const decoded: any = jwt.verify(resetToken, process.env.JWT_SECRET!);

    const user = await User.findById(decoded.id);
    if (!user || user.email !== email) return res.status(403).json({ message: "Unauthorized" });

    // Password update (Pre-save hook in user model will hash it)
    user.password = newPassword;
    user.forgotPasswordOtp = null;
    user.forgotPasswordOtpExpiry = null;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    res.status(401).json({ message: "Session expired, please try again." });
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