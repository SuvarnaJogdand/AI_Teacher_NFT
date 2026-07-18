import express from "express";

import {
    updateSubscriptionPrice,
    subscribeTeacher,
    activateFiatSubscription,
    getSubscriptionPlan,
    getSubscriptionPrices,
    hasSubscription,
    getSubscriptionExpiry
} from "../controllers/subscriptionController.js";

const router = express.Router();

// ----------------------------------------
// Set Subscription Prices
// POST /api/subscription/set-price
// ----------------------------------------

router.post(
    "/set-price",
    updateSubscriptionPrice
);

// ----------------------------------------
// Purchase Subscription
// POST /api/subscription/subscribe
// ----------------------------------------

router.post(
    "/subscribe",
    subscribeTeacher
);

// ----------------------------------------
// Activate Subscription
// (After Razorpay/Fiat Payment)
// POST /api/subscription/activate
// ----------------------------------------

router.post(
    "/activate",
    activateFiatSubscription
);

// ----------------------------------------
// Get Subscription Plan
// GET /api/subscription/:tokenId/plan
// ----------------------------------------

router.get(
    "/:tokenId/plan",
    getSubscriptionPlan
);

// ----------------------------------------
// Get Subscription Prices
// GET /api/subscription/:tokenId/prices
// ----------------------------------------

router.get(
    "/:tokenId/prices",
    getSubscriptionPrices
);

// ----------------------------------------
// Check Subscription Status
// GET /api/subscription/:tokenId/:user/status
// ----------------------------------------

router.get(
    "/:tokenId/:user/status",
    hasSubscription
);

// ----------------------------------------
// Get Subscription Expiry
// GET /api/subscription/:tokenId/:user/expiry
// ----------------------------------------

router.get(
    "/:tokenId/:user/expiry",
    getSubscriptionExpiry
);

export default router;