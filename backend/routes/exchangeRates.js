import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const polResponse = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token&vs_currencies=usd"
    );

    const polUsd =
      polResponse.data["polygon-ecosystem-token"].usd;

    const currencyResponse = await axios.get(
      "https://open.er-api.com/v6/latest/USD"
    );

    res.json({
      polUsd,
      rates: currencyResponse.data.rates,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch exchange rates",
    });
  }
});

export default router;