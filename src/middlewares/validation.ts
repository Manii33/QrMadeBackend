import { Request, Response, NextFunction } from "express";

export const signupValidation = (req: Request, res: Response, next: NextFunction) => {
  const {  email, password } = req.body;

  if ( !email || !password) {
    return res.status(400).json({
      status: 400,
      message: "All fields are required",
    });
  }

  next();
};
