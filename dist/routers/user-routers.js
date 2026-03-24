"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../Controllers/user-controller");
const validation_1 = require("../middlewares/validation");
const router = express_1.default.Router();
router.post("/signup", validation_1.signupValidation, user_controller_1.signup);
router.post("/login", user_controller_1.loginUser);
router.post("/forget-password", user_controller_1.forgetPassword);
router.post("/qr", user_controller_1.generateUserQR);
exports.default = router;
