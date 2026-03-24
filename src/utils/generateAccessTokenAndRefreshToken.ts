import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../models/user-model";

const generateAccessTokenAndRefreshToken = async (
  userId: string
): Promise<{ accessToken: string; refreshToken: string }> => {

  if (!userId) throw new Error("User ID required hai");

  const user = await User.findById(userId);
  if (!user) throw new Error("User database mein nahi mila");

  const accessOptions: SignOptions = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE as jwt.SignOptions["expiresIn"]
  };

  const refreshOptions: SignOptions = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE as jwt.SignOptions["expiresIn"]
  };

  const accessToken = jwt.sign(
    { id: user._id },
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    accessOptions
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_TOKEN_SECRET as string,
    refreshOptions
  );

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

export { generateAccessTokenAndRefreshToken };