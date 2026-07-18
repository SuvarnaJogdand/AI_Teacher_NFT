import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

class RazorpayService {

    // -----------------------------------
    // Create Razorpay Order
    // -----------------------------------

    async createOrder(amount, currency = "INR", receipt) {

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects paise
            currency,
            receipt,
            payment_capture: 1
        };

        return await razorpay.orders.create(options);
    }

    // -----------------------------------
    // Verify Signature
    // -----------------------------------

    verifySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
    ) {

        const body =
            razorpayOrderId +
            "|" +
            razorpayPaymentId;

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(body)
                .digest("hex");

        return expectedSignature === razorpaySignature;
    }

    // -----------------------------------
    // Fetch Payment Details
    // -----------------------------------

    async fetchPayment(paymentId) {

        return await razorpay.payments.fetch(paymentId);

    }

    // -----------------------------------
    // Fetch Order Details
    // -----------------------------------

    async fetchOrder(orderId) {

        return await razorpay.orders.fetch(orderId);

    }

    // -----------------------------------
    // Refund Payment
    // -----------------------------------

    async refundPayment(paymentId, amount = null) {

        const options = {};

        if (amount) {
            options.amount = Math.round(amount * 100);
        }

        return await razorpay.payments.refund(
            paymentId,
            options
        );
    }

    // -----------------------------------
    // Generate Receipt
    // -----------------------------------

    generateReceipt(prefix = "AI") {

        return (
            prefix +
            "_" +
            Date.now()
        );

    }

}

export default new RazorpayService();