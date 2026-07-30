import { createOrder } from "../services/cashfreeService.js";

export const createPayment = async (req, res) => {
    try {

        const {
            tokenId,
            amount,
            walletAddress
        } = req.body;

        const order = await createOrder({
            orderId: "ORDER_" + Date.now(),
            amount,
            customerId: walletAddress,
            customerName: "AI Teacher Student",
            customerEmail: "student@test.com",
            customerPhone: "9999999999"
        });

        res.json({
            success: true,
            order
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};