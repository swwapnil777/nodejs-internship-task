"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = __importDefault(require("../controllers/authController"));
const authRouter = (0, express_1.Router)();
authRouter.route("/login").post(authController_1.default.login);
authRouter.route("/register").post(authController_1.default.register);
authRouter.route("/forgot-password").post(authController_1.default.forgotPassword);
// Add route for reset password
authRouter.route("/reset-password").post(authController_1.default.resetPassword);
exports.default = authRouter;
