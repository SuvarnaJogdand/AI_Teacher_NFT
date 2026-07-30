import express from "express";

import {
    convertPrice,
    getCurrencies
} from "../controllers/exchangeController.js";

const router = express.Router();

// -----------------------------------------
// Convert Currency
// GET /api/exchange/convert
// -----------------------------------------

router.get("/convert", convertPrice);

// -----------------------------------------
// Supported Currencies
// GET /api/exchange/currencies
// -----------------------------------------

router.get("/currencies", getCurrencies);

// -----------------------------------------

export default router;