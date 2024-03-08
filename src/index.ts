import express from "express";
import authRouter from "./routes/auth.route";
import { connectToDatabase } from "./config/db";
import dotenv from "dotenv";
dotenv.config();
const main = async () => {
  const app = express();
  app.use("/api/auth", authRouter);

  app.listen(process.env.PORT, async () => {
    console.log(`Listening on port ${process.env.PORT}`);
    await connectToDatabase();
  });
};

main();
