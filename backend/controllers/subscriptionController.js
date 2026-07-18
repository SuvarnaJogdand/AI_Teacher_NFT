import { ethers } from "ethers";

import {
    subscriptionContract,
    setSubscriptionPrice,
     subscribeTeacher as subscribeTeacherOnChain,
    activateSubscription
} from "../services/blockchainService.js";


// ----------------------------------------
// Set Subscription Prices
// ----------------------------------------

export const updateSubscriptionPrice = async (req, res) => {
    try {
        const {
            tokenId,
            monthlyPrice,
            yearlyPrice
        } = req.body;

        if (!tokenId) {
            return res.status(400).json({
                success: false,
                message: "tokenId is required"
            });
        }

        const tx = await setSubscriptionPrice(
            tokenId,
            ethers.parseEther((monthlyPrice || 0).toString()),
            ethers.parseEther((yearlyPrice || 0).toString())
        );

        res.status(200).json({
            success: true,
            message: "Subscription prices updated",
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
// Subscribe
// ----------------------------------------

export const subscribeTeacher = async (req, res) => {

    try {

        const {
            tokenId,
            yearly,
            amount
        } = req.body;

        const tx = await subscribeTeacherOnChain(
            tokenId,
            yearly,
            ethers.parseEther(amount.toString())
        );

        res.status(200).json({
            success: true,
            message: "Subscription purchased",
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
// Activate Fiat Subscription
// ----------------------------------------

export const activateFiatSubscription = async (req, res) => {

    try {

        const {
            paymentId,
            tokenId,
            student,
            duration,
            amount
        } = req.body;

        const tx =
            await activateSubscription(
                paymentId,
                tokenId,
                student,
                duration,
                ethers.parseEther(amount.toString())
            );

        res.status(200).json({
            success: true,
            message: "Subscription activated",
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
// Get Subscription Plan
// ----------------------------------------

export const getSubscriptionPlan = async (req, res) => {

    try {

        const { tokenId } = req.params;

        const plan =
            await subscriptionContract.getPlan(tokenId);

        res.json({
            success: true,
            plan
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
// Check Subscription
// ----------------------------------------

export const hasSubscription = async (req, res) => {

    try {

        const {
            tokenId,
            user
        } = req.params;

        const subscribed =
            await subscriptionContract.hasSubscription(
                tokenId,
                user
            );

        res.json({
            success: true,
            subscribed
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
// Get Subscription Expiry
// ----------------------------------------

export const getSubscriptionExpiry = async (req, res) => {

    try {

        const {
            tokenId,
            user
        } = req.params;

        const expiry =
            await subscriptionContract.getExpiry(
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
// Get Subscription Prices
// ----------------------------------------

export const getSubscriptionPrices = async (req, res) => {

    try {

        const { tokenId } = req.params;

        const plan =
            await subscriptionContract.getPlan(tokenId);

        res.json({
            success: true,
            monthlyPrice: plan.monthlyPrice.toString(),
            yearlyPrice: plan.yearlyPrice.toString(),
            enabled: plan.enabled
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};