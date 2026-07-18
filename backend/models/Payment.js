import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        // ---------------------------------
        // Payment ID (Blockchain)
        // ---------------------------------
        paymentId: {
            type: String,
            required: true,
            unique: true
        },

        // ---------------------------------
        // Teacher NFT
        // ---------------------------------
        tokenId: {
            type: Number,
            required: true
        },

        // ---------------------------------
        // Student Wallet
        // ---------------------------------
        studentWallet: {
            type: String,
            required: true,
            lowercase: true
        },

        // ---------------------------------
        // Teacher Wallet
        // ---------------------------------
        teacherWallet: {
            type: String,
            required: true,
            lowercase: true
        },

        // ---------------------------------
        // Payment Type
        // ---------------------------------
        paymentType: {
            type: String,
            enum: [
                "subscription",
                "rental",
                "purchase"
            ],
            required: true
        },

        // ---------------------------------
        // Payment Gateway
        // ---------------------------------
        gateway: {
            type: String,
            enum: [
                "razorpay",
                "stripe",
                "crypto"
            ],
            default: "razorpay"
        },

        // ---------------------------------
        // Currency
        // ---------------------------------
        currency: {
            type: String,
            required: true
        },

        // ---------------------------------
        // Amount Paid
        // ---------------------------------
        amount: {
            type: Number,
            required: true
        },

        // ---------------------------------
        // Base Price (USD)
        // ---------------------------------
        baseAmount: {
            type: Number,
            default: 0
        },

        baseCurrency: {
            type: String,
            default: "USD"
        },

        // ---------------------------------
        // Razorpay Details
        // ---------------------------------
        razorpayOrderId: {
            type: String,
            default: ""
        },

        razorpayPaymentId: {
            type: String,
            default: ""
        },

        razorpaySignature: {
            type: String,
            default: ""
        },

        // ---------------------------------
        // Blockchain
        // ---------------------------------
        blockchainTxHash: {
            type: String,
            default: ""
        },

        network: {
            type: String,
            default: "Polygon Amoy"
        },

        // ---------------------------------
        // Subscription / Rental Duration
        // ---------------------------------
        durationDays: {
            type: Number,
            default: 0
        },

        // ---------------------------------
        // Status
        // ---------------------------------
        status: {
            type: String,
            enum: [
                "pending",
                "success",
                "failed",
                "refunded"
            ],
            default: "pending"
        },

        // ---------------------------------
        // Country
        // ---------------------------------
        country: {
            type: String,
            default: ""
        },

        // ---------------------------------
        // Notes
        // ---------------------------------
        remarks: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Payment", paymentSchema);