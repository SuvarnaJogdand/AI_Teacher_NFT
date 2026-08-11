import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL =
  process.env.CASHFREE_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export async function createCashfreeOrder(order) {
  const response = await axios.post(
    `${BASE_URL}/orders`,
    order,
    {
      headers: {
        "Content-Type": "application/json",

        "x-api-version": "2023-08-01",

        "x-client-id": process.env.CASHFREE_APP_ID,

        "x-client-secret":
          process.env.CASHFREE_SECRET_KEY,
      },
    }
  );

  return response.data;
}