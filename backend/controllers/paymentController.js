import { recordPayment, activateSubscription, activateRental, completePurchase } from "../services/blockchainService.js";
import razorpayService from "../services/razorpayService.js";
import exchangeRateService from "../services/exchangeRateService.js";
import crypto from "crypto";

// ------------------------------------------
// Create Razorpay Order
// ------------------------------------------

export const createOrder = async (req, res) => {
    try {
        const {
            tokenId,
            studentWallet,
            amount,
            currency = "INR",
            type
        } = req.body;

        const receipt =
            razorpayService.generateReceipt(type);

        const order =
            await razorpayService.createOrder(
                amount,
                currency,
                receipt
            );

        res.status(200).json({
            success: true,
            order,
            tokenId,
            studentWallet,
            paymentType: type
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// ------------------------------------------
// Verify Razorpay Payment
// ------------------------------------------

export const verifyPayment = async (req, res) => {

    try {

        const {

            razorpay_order_id,

            razorpay_payment_id,

            razorpay_signature,

            tokenId,

            studentWallet,

            amount,

            paymentType,

            duration

        } = req.body;

        const verified =
            razorpayService.verifySignature(

                razorpay_order_id,

                razorpay_payment_id,

                razorpay_signature

            );

        if (!verified) {

            return res.status(400).json({

                success: false,

                message: "Invalid Razorpay Signature"

            });

        }

        //-------------------------------------------------
        // Record payment on blockchain
        //-------------------------------------------------

        const paymentId =
            "0x" +
            crypto.randomBytes(32).toString("hex");

        await recordPayment(
            paymentId,
            tokenId,
            studentWallet,
            amount,
            4
        );

        //-------------------------------------------------
        // Subscription
        //-------------------------------------------------

        if (paymentType === "subscription") {

            await activateSubscription(

                paymentId,

                tokenId,

                studentWallet,

                duration,

                amount

            );

        }

        //-------------------------------------------------
        // Rental
        //-------------------------------------------------

        else if (paymentType === "rental") {

            await activateRental(

                paymentId,

                tokenId,

                studentWallet,

                duration,

                amount

            );

        }

        //-------------------------------------------------
        // NFT Purchase
        //-------------------------------------------------

        else if (paymentType === "purchase") {

            await completePurchase(
                paymentId,
                tokenId,
                studentWallet,
                ethers.parseEther(amount.toString())
            );

        }

        res.status(200).json({

            success: true,

            paymentId,

            transaction: "Blockchain Updated"

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ------------------------------------------
// Convert Currency
// ------------------------------------------

export const convertPrice = async (req, res) => {

    try {

        const {

            amount,

            from,

            to

        } = req.query;

        const converted =
            await exchangeRateService.convert(

                Number(amount),

                from,

                to

            );

        res.status(200).json({

            success: true,

            amount: converted,

            currency: to,

            symbol:
                exchangeRateService.getSymbol(to)

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ------------------------------------------
// Get Supported Currencies
// ------------------------------------------

export const getCurrencies = async (req, res) => {

    res.json({

        success: true,

        currencies:
            exchangeRateService.getSupportedCurrencies()

    });

};