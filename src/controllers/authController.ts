import { NextFunction, Request, Response } from "express";
import z from "zod";
import { UserSchema } from "../schemas/UserSchema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const loginSchema = z.object({
  username: z.string({ required_error: "Username is required!" }),
  password: z.string({ required_error: "Password is required!" }),
});

const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required!" })
    .email("Email address must be valid!"),
});

const registerSchema = z.object({
  username: z.string({ required_error: "Username is required!" }),
  password: z.string({ required_error: "Password is required!" }),
  email: z
    .string({ required_error: "Email is required!" })
    .email("Email address must be valid!"),
});

const resetPasswordSchema = z.object({
  username: z.string({ required_error: "Username is required!" }),
  password: z.string({ required_error: "Password is required!" }),
  email: z
    .string({ required_error: "Email is required!" })
    .email("Email address must be valid!"),
  resetToken: z.string({ required_error: "Reset token is required!" }), // Include reset token in schema
});

class AuthController {
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password, email, resetToken } =
        await resetPasswordSchema.parseAsync(req.body);

      // Verify token
      jwt.verify(
        resetToken,
        "forgot-password-secret",
        async (err: any, decodedToken: any) => {
          if (err) {
            return res
              .status(400)
              .json({ ok: false, message: "Invalid or expired token" });
          }

          // Find user by email and username
          const user = await UserSchema.findOne({ email, username });
          if (!user) {
            return res
              .status(404)
              .json({ ok: false, message: "User not found!" });
          }

          // Update user's password
          const hashedPassword = await bcrypt.hash(password, 10);
          user.password = hashedPassword;
          await user.save();

          return res
            .status(200)
            .json({ ok: true, message: "Password reset successfully!" });
        }
      );
    } catch (error) {
      res.status(500).json({ ok: false, message: "Internal server error!" });
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedBody = await forgotPasswordSchema.parseAsync(req.body);
      const user = await UserSchema.findOne({ email: parsedBody.email });

      if (!user)
        return res.status(404).json({ ok: false, message: "User not found!" });

      const token = jwt.sign(
        { _id: user.id, email: parsedBody.email },
        "forgot-password-secret",
        {
          expiresIn: 60 * 15, // 15 minutes in seconds
        }
      );

      // send token to email
      // Here you would typically send an email with the token to the user's email address
      // For the sake of this example, let's just return the token
      return res.status(200).json({
        ok: true,
        message: "Forgot password token generated successfully!",
        token,
      });
    } catch (error) {
      res.status(500).json({ ok: false, message: "Internal server error!" });
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedBody = await loginSchema.parseAsync(req.body);
      const user = await UserSchema.findOne({ username: parsedBody.username });
      if (!user) {
        return res.status(404).json({ ok: false, message: "User not found!" });
      }

      const passwordMatch = await bcrypt.compare(
        parsedBody.password,
        user.password
      );
      if (!passwordMatch) {
        return res
          .status(401)
          .json({ ok: false, message: "Incorrect password!" });
      }

      const token = jwt.sign({ _id: user.id }, "your-secret-key", {
        expiresIn: "1h",
      });

      res.status(200).json({ ok: true, token });
    } catch (error) {
      res.status(500).json({ ok: false, message: "Internal server error!" });
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body);
      const parsedBody = await registerSchema.parseAsync(req.body);

      // Check if the username already exists
      const existingUser = await UserSchema.findOne({
        username: parsedBody.username,
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ ok: false, message: "Username already exists!" });
      }

      // Check if the email already exists
      const existingEmail = await UserSchema.findOne({
        email: parsedBody.email,
      });
      if (existingEmail) {
        return res
          .status(400)
          .json({ ok: false, message: "Email already exists!" });
      }

      const hashedPassword = await bcrypt.hash(parsedBody.password, 10);

      const user = await UserSchema.create({
        ...parsedBody,
        password: hashedPassword,
      });

      res.status(201).json({
        ok: true,
        message: "User created successfully!",
        user,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ ok: false, message: "Internal server error!" });
    }
  }
}

export default AuthController;
