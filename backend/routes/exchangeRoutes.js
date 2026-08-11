// import express from "express";

// import {
//     convertPrice,
//     getCurrencies
// } from "../controllers/exchangeController.js";

// const router = express.Router();

// // -----------------------------------------
// // Convert Currency
// // GET /api/exchange/convert
// // -----------------------------------------

// router.get("/convert", convertPrice);

// // -----------------------------------------
// // Supported Currencies
// // GET /api/exchange/currencies
// // -----------------------------------------

// router.get("/currencies", getCurrencies);

// // -----------------------------------------

// export default router;

import express from "express";
import exchangeRateService from "../services/ExchangeRateService.js";

const router = express.Router();


router.get("/api/exchange-rates", async (req, res) => {

    try {


        const polUsd =
            await exchangeRateService.getPOLPriceUSD();



        const rates =
            await exchangeRateService.loadRates("USD");



        console.log(
            "POL USD:",
            polUsd
        );


        res.json({

            polUsd,

            rates

        });



    }
    catch(error){


        console.error(
            "Exchange API Error:",
            error
        );


        res.status(500).json({

            error:
            "Exchange rate failed"

        });


    }

});


export default router;