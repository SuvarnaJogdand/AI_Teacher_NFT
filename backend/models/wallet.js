import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    nonce: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "user",
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Wallet =
  mongoose.models.Wallet ||
  mongoose.model("Wallet", walletSchema);

export default Wallet;