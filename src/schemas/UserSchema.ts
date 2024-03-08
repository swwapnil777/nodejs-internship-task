import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
});

export const UserSchema = mongoose.model("users", userSchema);
