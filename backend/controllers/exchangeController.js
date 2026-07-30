import axios from "axios";

export const convertPrice = async (req, res) => {
    try {
        const { amount, from, to } = req.query;

        const response = await axios.get(
            `https://api.exchangerate-api.com/v4/latest/${from}`
        );

        const rate = response.data.rates[to];

        res.json({
            converted: amount * rate,
            rate,
        });

    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
};

export const getCurrencies = async (req, res) => {
    res.json([
        "INR",
        "USD",
        "EUR",
        "GBP",
        "JPY",
        "CAD",
    ]);
};