import { v4 as uuid } from "uuid";

import Payment from "../models/Payment.js";

import { createCashfreeOrder } from "../services/cashfreeService.js";

export const createPayment = async (req, res) => {
  try {
    console.log("========== CREATE PAYMENT ==========");
    console.log("Request body:", req.body);

    const {
      teacherId,
      amount,
      studentWallet,
      customerName,
      customerEmail,
      customerPhone,
      plan,
    } = req.body;

    console.log("Creating Cashfree order:", {
      teacherId,
      amount,
      studentWallet,
      plan,
    });

    const orderId = uuid();

    const order = {
      order_id: orderId,
      order_amount: Number(Number(amount).toFixed(2)),
      order_currency: "INR",

      customer_details: {
        customer_id: studentWallet,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },

      order_meta: {
        return_url: "http://localhost:5173/payment-success",
      },
    };

    console.log("Cashfree order:", order);

    const cashfree = await createCashfreeOrder(order);

    console.log("Cashfree response:", cashfree);

    await Payment.create({
      orderId,
      paymentSessionId: cashfree.payment_session_id,
      teacherId,
      studentWallet,
      customerName,
      customerEmail,
      customerPhone,
      amount: Number(amount),
      currency: "INR",
      paymentStatus: "PENDING",
      plan,
    });

    res.json({
      success: true,
      orderId,
      paymentSessionId: cashfree.payment_session_id,
    });

  } catch (err) {
    console.error("========== PAYMENT ERROR ==========");
    console.error("Message:", err.message);
    console.error("Status:", err.response?.status);
    console.error("Cashfree error:", err.response?.data);

    res.status(500).json({
      success: false,
      error:
        err.response?.data?.message ||
        err.response?.data?.error_description ||
        err.response?.data ||
        err.message,
    });
  }
};