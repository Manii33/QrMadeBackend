"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUserQR = exports.forgetPassword = exports.loginUser = exports.signup = void 0;
const user_model_1 = require("../models/user-model");
const generateAccessTokenAndRefreshToken_1 = require("../utils/generateAccessTokenAndRefreshToken");
const qr_1 = require("../utils/qr");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        if ([name, email, password]
            .some((field) => !(field === null || field === void 0 ? void 0 : field.trim()))) {
            return res.status(400).json({
                status: 400,
                message: "All fields are required",
            });
        }
        const user = yield user_model_1.User.create({
            name,
            email,
            password,
        });
        const response = yield user_model_1.User.findById(user === null || user === void 0 ? void 0 : user._id).select("-password -__v");
        if (!response) {
            return res.status(404).json({ status: 404, message: "User not found after registration" });
        }
        const { accessToken, refreshToken } = yield (0, generateAccessTokenAndRefreshToken_1.generateAccessTokenAndRefreshToken)(user === null || user === void 0 ? void 0 : user._id.toString());
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
            .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        console.log("User Created", response);
        return res.status(200).json({ status: 200, message: "User registered successfully", data: response });
    }
    catch (error) {
        return next(error);
    }
});
exports.signup = signup;
// LOGIN
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ status: 400, message: "Email and password are required" });
        }
        const user = yield user_model_1.User.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }
        const isPasswordValid = yield user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: 401, message: "Invalid credentials" });
        }
        const { accessToken, refreshToken } = yield (0, generateAccessTokenAndRefreshToken_1.generateAccessTokenAndRefreshToken)(user._id.toString());
        const loggedInUser = yield user_model_1.User.findById(user._id).select("-password -__v");
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
    }
    catch (error) {
        return next(error);
    }
});
exports.loginUser = loginUser;
// FORGET PASSWORD
const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield user_model_1.User.findOne({ email });
        if (!user)
            return res.status(404).json({ status: 404, message: "User not found" });
        const resetToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        yield transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset",
            text: `Reset link: http://localhost:5173/reset-password/${resetToken}`,
        });
        res.status(200).json({ status: 200, message: "Reset email sent" });
    }
    catch (error) {
        res.status(500).json({ message: "Error sending email" });
    }
});
exports.forgetPassword = forgetPassword;
// GENERATE QR
const generateUserQR = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        const qr = yield (0, qr_1.generateQR)(data);
        res.status(200).json({ status: 200, data: { qr } });
    }
    catch (error) {
        res.status(500).json({ message: "QR generation failed" });
    }
});
exports.generateUserQR = generateUserQR;
