import { ethers } from "ethers";
import {
    marketplaceContract,
    listNFT,
    buyNFT
} from "../services/blockchainService.js";

// ----------------------------------------
// List NFT For Sale
// ----------------------------------------

export const listForSale = async (req, res) => {
    try {
        const { tokenId, price } = req.body;

        if (!tokenId || !price) {
            return res.status(400).json({
                success: false,
                message: "tokenId and price are required"
            });
        }

        const tx = await listNFT(
            tokenId,
            ethers.parseEther(price.toString())
        );

        res.status(200).json({
            success: true,
            message: "NFT listed successfully",
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
// Buy NFT
// ----------------------------------------

export const purchaseNFT = async (req, res) => {

    try {

        const {
            tokenId,
            price
        } = req.body;

        if (!tokenId || !price) {
            return res.status(400).json({
                success: false,
                message: "tokenId and price are required"
            });
        }

        const tx = await buyNFT(
            tokenId,
            ethers.parseEther(price.toString())
        );

        res.status(200).json({
            success: true,
            message: "NFT purchased successfully",
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
// Cancel Sale
// ----------------------------------------

export const cancelSale = async (req, res) => {

    try {

        const { tokenId } = req.body;

        const tx =
            await marketplaceContract.cancelListing(
                tokenId
            );

        await tx.wait();

        res.json({
            success: true,
            message: "Listing cancelled",
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
// Get Listing
// ----------------------------------------

export const getListing = async (req, res) => {

    try {

        const { tokenId } = req.params;

        const listing =
            await marketplaceContract.getListing(
                tokenId
            );

        res.json({
            success: true,
            listing
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
// Check Listing Status
// ----------------------------------------

export const isListed = async (req, res) => {

    try {

        const { tokenId } = req.params;

        const listing =
            await marketplaceContract.getListing(
                tokenId
            );

        res.json({
            success: true,
            listed: listing.active
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};