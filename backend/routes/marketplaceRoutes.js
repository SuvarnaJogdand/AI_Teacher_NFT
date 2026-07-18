import express from "express";

import {
    listForSale,
    purchaseNFT,
    cancelSale,
    getListing,
    isListed
} from "../controllers/marketplaceController.js";

const router = express.Router();

// ----------------------------------------
// List NFT for Sale
// POST /api/marketplace/list
// ----------------------------------------

router.post("/list", listForSale);

// ----------------------------------------
// Buy NFT
// POST /api/marketplace/buy
// ----------------------------------------

router.post("/buy", purchaseNFT);

// ----------------------------------------
// Cancel Listing
// POST /api/marketplace/cancel
// ----------------------------------------

router.post("/cancel", cancelSale);

// ----------------------------------------
// Check Listing Status
// GET /api/marketplace/:tokenId/status
// ----------------------------------------

router.get("/:tokenId/status", isListed);

// ----------------------------------------
// Get Listing Details
// GET /api/marketplace/:tokenId
// ----------------------------------------

router.get("/:tokenId", getListing);

export default router;