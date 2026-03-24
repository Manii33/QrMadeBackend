"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupValidation = void 0;
const signupValidation = (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({
            status: 400,
            message: "All fields are required",
        });
    }
    next();
};
exports.signupValidation = signupValidation;
