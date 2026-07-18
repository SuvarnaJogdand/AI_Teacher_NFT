// routes/user.js

import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/save-country", async (req, res) => {
  try {
    const { walletAddress, country } = req.body;

    const currencyMap = {
      India: "INR",
      USA: "USD",
      UK: "GBP",
      Canada: "CAD",
      Japan: "JPY",
    };

    const user = await User.findOneAndUpdate(
      { walletAddress },
      {
        country,
        currency: currencyMap[country] || "USD",
      },
      { upsert: true, new: true }
    );

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error saving country",
    });
  }
});

export default router;