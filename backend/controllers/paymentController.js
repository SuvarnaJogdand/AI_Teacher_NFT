import { v4 as uuid } from "uuid";

import Payment from "../models/Payment.js";

import { createCashfreeOrder } from "../services/cashfreeService.js";

export const createPayment = async (req, res) => {
  try {
    const {
      teacherId,
      amount,
      studentWallet,
      customerName,
      customerEmail,
      customerPhone,
      plan,
    } = req.body;

    const orderId = uuid();

    const order = {
      order_id: orderId,

      order_amount: amount,

      order_currency: "INR",

      customer_details: {
        customer_id: studentWallet,

        customer_name: customerName,

        customer_email: customerEmail,

        customer_phone: customerPhone,
      },

      order_meta: {
        return_url:
          "http://localhost:5173/payment-success",
      },
    };

    const cashfree =
      await createCashfreeOrder(order);

    await Payment.create({
      orderId,

      paymentSessionId:
        cashfree.payment_session_id,

      teacherId,

      studentWallet,

      customerName,

      customerEmail,

      customerPhone,

      amount,

      currency: "INR",

      paymentStatus: "PENDING",

      plan,
    });

    res.json({
      success: true,

      orderId,

      paymentSessionId:
        cashfree.payment_session_id,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};