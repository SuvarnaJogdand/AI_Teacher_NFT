import dotenv from "dotenv";
import { Cashfree } from "cashfree-pg";

dotenv.config();

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

export async function createOrder({
    orderId,
    amount,
    customerId,
    customerName,
    customerEmail,
    customerPhone
}) {

    const request = {

        order_id: orderId,

        order_amount: amount,

        order_currency: "INR",

        customer_details: {
            customer_id: customerId,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone
        }

    };

    const response =
        await Cashfree.PGCreateOrder(request);

    return response.data;
}