import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  email: string;
  password: string;
  refreshToken?: string | null;
  forgotPasswordOtp : string | null;
  forgotPasswordOtpExpiry : Date | null;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  createdAt: Date;
  updatedAt: Date;
}



const userSchema: Schema<IUser> = new mongoose.Schema(
  {
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
    forgotPasswordOtp: {
      type: String,
      default: null,
    },
    forgotPasswordOtpExpiry: {
      type: Date,
      default: null,
    },
  }, 
  { timestamps: true }
);



// 🔐 Hash password before saving
userSchema.pre("save", async function (this: any) {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// 🔑 Compare password
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// 🎟 Generate Access Token
userSchema.methods.generateAccessToken = function (this: IUser): string {
  if (!process.env.JWT_ACCESS_TOKEN_SECRET) {
    throw new Error("JWT_ACCESS_TOKEN_SECRET is not defined");
  }
  if (!process.env.ACCESS_TOKEN_EXPIRE) {
    throw new Error("ACCESS_TOKEN_EXPIRE is not defined");
  }

  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE as any,
    }
  );
};

// 🔄 Generate Refresh Token
userSchema.methods.generateRefreshToken = function (this: IUser): string {
  if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
    throw new Error("JWT_REFRESH_TOKEN_SECRET is not defined");
  }
  if (!process.env.REFRESH_TOKEN_EXPIRE) {
    throw new Error("REFRESH_TOKEN_EXPIRE is not defined");
  }

  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.JWT_REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE as any,
    }
  );
};

export const User = mongoose.model<IUser>("User", userSchema);