import express from "express";

import {
    createRental,
    rentNFT,
    cancelRental,
    getRental,
    isRentalAvailable,
    getRentalExpiry,
    hasRentalAccess
} from "../controllers/rentalController.js";

const router = express.Router();

// ----------------------------------------
// List NFT for Rent
// POST /api/rental/list
// ----------------------------------------

router.post("/list", createRental);

// ----------------------------------------
// Rent NFT
// POST /api/rental/rent
// ----------------------------------------

router.post("/rent", rentNFT);

// ----------------------------------------
// Cancel Rental
// POST /api/rental/cancel
// ----------------------------------------

router.post("/cancel", cancelRental);

// ----------------------------------------
// Check Rental Status
// GET /api/rental/:tokenId/status
// ----------------------------------------

router.get("/:tokenId/status", isRentalAvailable);

// ----------------------------------------
// Get Rental Details
// GET /api/rental/:tokenId
// ----------------------------------------

router.get("/:tokenId", getRental);

// ----------------------------------------
// Get Rental Expiry
// GET /api/rental/:tokenId/expiry/:user
// ----------------------------------------

router.get("/:tokenId/expiry/:user", getRentalExpiry);

// ----------------------------------------
// Check User Rental Access
// GET /api/rental/:tokenId/access/:user
// ----------------------------------------

router.get("/:tokenId/access/:user", hasRentalAccess);

export default router;