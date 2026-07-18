import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
    },

    password: {
      type: String,
    },

    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },

    nonce: {
      type: String,
      default: "",
    },

    country: {
      type: String,
      default: "",
    },

    preferredCurrency: {
      type: String,
      default: "USD",
    },

    profileImage: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    password: {
      type: String,
    },

    country: {
      type: String,
      default: "India",
    },

    currency: {
      type: String,
      default: "INR",
    },
  },
  {
    timestamps: true,
  },






);

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default User;