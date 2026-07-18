import { ethers } from "ethers";

import {
    rentalContract,
    listForRent,
    rentTeacher
} from "../services/blockchainService.js";

// ----------------------------------------
// List NFT For Rent
// ----------------------------------------

export const createRental = async (req, res) => {
    try {
        const { tokenId, pricePerDay } = req.body;

        if (!tokenId || !pricePerDay) {
            return res.status(400).json({
                success: false,
                message: "tokenId and pricePerDay are required"
            });
        }

        const tx = await listForRent(
            tokenId,
            ethers.parseEther(pricePerDay.toString())
        );

        res.status(200).json({
            success: true,
            message: "NFT listed for rent successfully",
            transactionHash: tx.hash
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ----------------------------------------
// Rent NFT
// ----------------------------------------

export const rentNFT = async (req, res) => {
    try {
        const {
            tokenId,
            daysCount,
            totalPrice
        } = req.body;

        if (!tokenId || !daysCount || !totalPrice) {
            return res.status(400).json({
                success: false,
                message: "tokenId, daysCount and totalPrice are required"
            });
        }

        const tx = await rentTeacher(
            tokenId,
            daysCount,
            ethers.parseEther(totalPrice.toString())
        );

        res.status(200).json({
            success: true,
            message: "NFT rented successfully",
            transactionHash: tx.hash
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ----------------------------------------
// Cancel Rental Listing
// ----------------------------------------

export const cancelRental = async (req, res) => {
    try {
        const { tokenId } = req.body;

        const tx = await rentalContract.cancelRent(tokenId);

        await tx.wait();

        res.status(200).json({
            success: true,
            message: "Rental cancelled",
            transactionHash: tx.hash
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ----------------------------------------
// Get Rental Details
// ----------------------------------------

export const getRental = async (req, res) => {
    try {
        const { tokenId } = req.params;

        const rental = await rentalContract.getRental(tokenId);

        res.json({
            success: true,
            rental
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ----------------------------------------
// Check Rental Status
// ----------------------------------------

export const isRentalAvailable = async (req, res) => {
    try {
        const { tokenId } = req.params;

        const available =
            await rentalContract.isForRent(tokenId);

        res.json({
            success: true,
            available
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ----------------------------------------
// Get Rental Expiry
// ----------------------------------------

export const getRentalExpiry = async (req, res) => {
    try {
        const { tokenId, user } = req.params;

        const expiry =
            await rentalContract.getRentalExpiry(
                tokenId,
                user
            );

        res.json({
            success: true,
            expiry: Number(expiry)
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ----------------------------------------
// Check User Access
// ----------------------------------------

export const hasRentalAccess = async (req, res) => {
    try {
        const { tokenId, user } = req.params;

        const access =
            await rentalContract.hasAccess(
                tokenId,
                user
            );

        res.json({
            success: true,
            hasAccess: access
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};