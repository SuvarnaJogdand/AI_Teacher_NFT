import express from "express";
import axios from "axios";

const router = express.Router();

//router.get("/", async (req, res) => {
//   try {
//     const polResponse = await axios.get(
//       "https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token&vs_currencies=usd"
//     );

//     const polUsd =
//       polResponse.data["polygon-ecosystem-token"].usd;

//     const currencyResponse = await axios.get(
//       "https://open.er-api.com/v6/latest/USD"
//     );

//     res.json({
//       polUsd,
//       rates: currencyResponse.data.rates,
//     });

//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Failed to fetch exchange rates",
//     });
//   }
// });

router.get("/", async (req, res) => {
    try {

        // Get USD exchange rates
        const response = await fetch(
            "https://api.exchangerate-api.com/v4/latest/USD"
        );

        if (!response.ok) {
            throw new Error("Exchange rate API failed");
        }

        const data = await response.json();


        // ------------------------------------
        // GET POL PRICE IN USD
        // ------------------------------------

        const polResponse = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token&vs_currencies=usd"
        );

        if (!polResponse.ok) {
            throw new Error("POL price API failed");
        }

        const polData = await polResponse.json();

        const polUsd =
            Number(
                polData["polygon-ecosystem-token"]?.usd
            );


        if (!polUsd || polUsd <= 0) {
            throw new Error("Invalid POL/USD price");
        }


        // ------------------------------------
        // RETURN ALL REQUIRED CURRENCIES
        // ------------------------------------

        res.json({

            polUsd: polUsd,

            rates: {

                USD: 1,

                INR: data.rates.INR,
                EUR: data.rates.EUR,
                GBP: data.rates.GBP,

                AUD: data.rates.AUD,
                CAD: data.rates.CAD,

                AED: data.rates.AED,
                JPY: data.rates.JPY,

                CHF: data.rates.CHF,
                SGD: data.rates.SGD,

                NZD: data.rates.NZD,
                CNY: data.rates.CNY,

                KRW: data.rates.KRW,
                BRL: data.rates.BRL,

                MXN: data.rates.MXN,
                ZAR: data.rates.ZAR,

                SAR: data.rates.SAR,
                QAR: data.rates.QAR,

                THB: data.rates.THB,
                MYR: data.rates.MYR
            }
        });

    } catch (error) {

        console.error(
            "Exchange rate error:",
            error
        );

        res.status(500).json({
            error: "Unable to fetch exchange rates"
        });

    }
});

export default router;