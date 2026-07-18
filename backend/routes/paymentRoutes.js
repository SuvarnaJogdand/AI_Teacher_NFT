import express from "express";

import {
    createOrder,
    verifyPayment,
    convertPrice,
    getCurrencies
} from "../controllers/paymentController.js";

const router = express.Router();

// -----------------------------------------
// Create Razorpay Order
// -----------------------------------------
router.post(
    "/create-order",
    createOrder
);

// -----------------------------------------
// Verify Payment
// -----------------------------------------
router.post(
    "/verify",
    verifyPayment
);

// -----------------------------------------
// Convert Currency
// -----------------------------------------
router.get(
    "/convert",
    convertPrice
);

// -----------------------------------------
// Get Supported Currencies
// -----------------------------------------
router.get(
    "/currencies",
    getCurrencies
);

export default router;