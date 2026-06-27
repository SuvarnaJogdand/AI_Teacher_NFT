import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
  getNonce,
  walletLogin,
  getProfile,
} from "../controllers/walletController.js";

const router = express.Router();

// Test Route
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Wallet Route Working",
  });
});

// Generate Nonce
router.post("/nonce", getNonce);

// Wallet Login
router.post("/login", walletLogin);

// Get Logged-in Wallet Profile
router.get(
  "/profile",
  protect,
  getProfile
);

export default router;