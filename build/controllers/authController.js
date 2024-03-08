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
const zod_1 = __importDefault(require("zod"));
const UserSchema_1 = require("../schemas/UserSchema");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const loginSchema = zod_1.default.object({
    username: zod_1.default.string({ required_error: "Username is required!" }),
    password: zod_1.default.string({ required_error: "Password is required!" }),
});
const forgotPasswordSchema = zod_1.default.object({
    email: zod_1.default
        .string({ required_error: "Email is required!" })
        .email("Email address must be valid!"),
});
const registerSchema = zod_1.default.object({
    username: zod_1.default.string({ required_error: "Username is required!" }),
    password: zod_1.default.string({ required_error: "Password is required!" }),
    email: zod_1.default
        .string({ required_error: "Email is required!" })
        .email("Email address must be valid!"),
});
const resetPasswordSchema = zod_1.default.object({
    username: zod_1.default.string({ required_error: "Username is required!" }),
    password: zod_1.default.string({ required_error: "Password is required!" }),
    email: zod_1.default
        .string({ required_error: "Email is required!" })
        .email("Email address must be valid!"),
    resetToken: zod_1.default.string({ required_error: "Reset token is required!" }), // Include reset token in schema
});
class AuthController {
    static resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password, email, resetToken } = yield resetPasswordSchema.parseAsync(req.body);
                // Verify token
                jsonwebtoken_1.default.verify(resetToken, "forgot-password-secret", (err, decodedToken) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        return res
                            .status(400)
                            .json({ ok: false, message: "Invalid or expired token" });
                    }
                    // Find user by email and username
                    const user = yield UserSchema_1.UserSchema.findOne({ email, username });
                    if (!user) {
                        return res
                            .status(404)
                            .json({ ok: false, message: "User not found!" });
                    }
                    // Update user's password
                    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                    user.password = hashedPassword;
                    yield user.save();
                    return res
                        .status(200)
                        .json({ ok: true, message: "Password reset successfully!" });
                }));
            }
            catch (error) {
                res.status(500).json({ ok: false, message: "Internal server error!" });
            }
        });
    }
    static forgotPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedBody = yield forgotPasswordSchema.parseAsync(req.body);
                const user = yield UserSchema_1.UserSchema.findOne({ email: parsedBody.email });
                if (!user)
                    return res.status(404).json({ ok: false, message: "User not found!" });
                const token = jsonwebtoken_1.default.sign({ _id: user.id, email: parsedBody.email }, "forgot-password-secret", {
                    expiresIn: 60 * 15, // 15 minutes in seconds
                });
                // send token to email
                // Here you would typically send an email with the token to the user's email address
                // For the sake of this example, let's just return the token
                return res.status(200).json({
                    ok: true,
                    message: "Forgot password token generated successfully!",
                    token,
                });
            }
            catch (error) {
                res.status(500).json({ ok: false, message: "Internal server error!" });
            }
        });
    }
    static login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedBody = yield loginSchema.parseAsync(req.body);
                const user = yield UserSchema_1.UserSchema.findOne({ username: parsedBody.username });
                if (!user) {
                    return res.status(404).json({ ok: false, message: "User not found!" });
                }
                const passwordMatch = yield bcrypt_1.default.compare(parsedBody.password, user.password);
                if (!passwordMatch) {
                    return res
                        .status(401)
                        .json({ ok: false, message: "Incorrect password!" });
                }
                const token = jsonwebtoken_1.default.sign({ _id: user.id }, "your-secret-key", {
                    expiresIn: "1h",
                });
                res.status(200).json({ ok: true, token });
            }
            catch (error) {
                res.status(500).json({ ok: false, message: "Internal server error!" });
            }
        });
    }
    static register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedBody = yield registerSchema.parseAsync(req.body);
                // Check if the username already exists
                const existingUser = yield UserSchema_1.UserSchema.findOne({
                    username: parsedBody.username,
                });
                if (existingUser) {
                    return res
                        .status(400)
                        .json({ ok: false, message: "Username already exists!" });
                }
                // Check if the email already exists
                const existingEmail = yield UserSchema_1.UserSchema.findOne({
                    email: parsedBody.email,
                });
                if (existingEmail) {
                    return res
                        .status(400)
                        .json({ ok: false, message: "Email already exists!" });
                }
                const hashedPassword = yield bcrypt_1.default.hash(parsedBody.password, 10);
                const user = yield UserSchema_1.UserSchema.create(Object.assign(Object.assign({}, parsedBody), { password: hashedPassword }));
                res.status(201).json({
                    ok: true,
                    message: "User created successfully!",
                    user,
                });
            }
            catch (error) {
                res.status(500).json({ ok: false, message: "Internal server error!" });
            }
        });
    }
}
exports.default = AuthController;
