import { Router } from "express";
import AuthController from "../controllers/authController";

const authRouter = Router();

authRouter.route("/login").post(AuthController.login);

authRouter.route("/register").post(AuthController.register);

authRouter.route("/forgot-password").post(AuthController.forgotPassword);

// Add route for reset password
authRouter.route("/reset-password").post(AuthController.resetPassword);

export default authRouter;
