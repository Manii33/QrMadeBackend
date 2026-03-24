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
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "password is required"],
    },
    refreshToken: {
        type: String,
        default: null,
    },
    confirmPassword: {
        type: String,
        required: [true, "confirm password is required"],
    },
}, { timestamps: true });
// 🔐 Hash password before saving
userSchema.pre("save", function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return;
        this.password = yield bcrypt_1.default.hash(this.password, 10);
    });
});
// 🔑 Compare password
userSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(password, this.password);
    });
};
userSchema.methods.isPasswordCorrect = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(password, this.password);
    });
};
// 🎟 Generate Access Token
userSchema.methods.generateAccessToken = function () {
    if (!process.env.JWT_ACCESS_TOKEN_SECRET) {
        throw new Error("JWT_ACCESS_TOKEN_SECRET is not defined");
    }
    if (!process.env.ACCESS_TOKEN_EXPIRE) {
        throw new Error("ACCESS_TOKEN_EXPIRE is not defined");
    }
    return jsonwebtoken_1.default.sign({
        _id: this._id,
        name: this.name,
        email: this.email,
    }, process.env.JWT_ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
    });
};
// 🔄 Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
    if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
        throw new Error("JWT_REFRESH_TOKEN_SECRET is not defined");
    }
    if (!process.env.REFRESH_TOKEN_EXPIRE) {
        throw new Error("REFRESH_TOKEN_EXPIRE is not defined");
    }
    return jsonwebtoken_1.default.sign({
        _id: this._id,
        name: this.name,
        email: this.email,
    }, process.env.JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
    });
};
exports.User = mongoose_1.default.model("User", userSchema);
