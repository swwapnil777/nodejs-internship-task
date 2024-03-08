import mongoose from "mongoose";

export const connectToDatabase = async () => {
  const uri = process.env.DATABASE_URL;
  try {
    await mongoose.connect(uri!!);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
};
