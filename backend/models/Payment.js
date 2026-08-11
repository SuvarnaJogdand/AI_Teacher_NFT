import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    paymentSessionId: String,

    teacherId: {
      type: Number,
      required: true,
    },

    studentWallet: {
      type: String,
      required: true,
    },

    customerName: String,
    customerEmail: String,
    customerPhone: String,

    amount: Number,
    currency: {
      type: String,
      default: "INR",
    },

    plan: {
      type: String,
      enum: ["MONTHLY", "YEARLY"],
    },

    paymentStatus: {
      type: String,
      default: "PENDING",
    },

    transactionId: String,

    blockchainTx: String,

    activated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Payment", paymentSchema);