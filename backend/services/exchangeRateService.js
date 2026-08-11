import axios from "axios";


class ExchangeRateService {

    constructor() {

        this.cache = {};

        this.lastUpdated = 0;

        this.cacheDuration =
            60 * 60 * 1000; // 1 hour

        this.polUsd = 0;

    }



    //-----------------------------------------
    // Load Fiat exchange rates
    //-----------------------------------------

    async loadRates(base="USD") {


        const now = Date.now();



        if(
            this.cache[base] &&
            now - this.lastUpdated <
            this.cacheDuration
        ){

            return this.cache[base];

        }




        const url =
        `https://open.er-api.com/v6/latest/${base}`;



        const response =
            await axios.get(url);



        this.cache[base] =
            response.data.rates;



        this.lastUpdated =
            now;



        return this.cache[base];

    }







    //-----------------------------------------
    // Get POL price in USD
    //-----------------------------------------

    async getPOLPriceUSD(){


        try{


            const response =
            await axios.get(

            "https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token&vs_currencies=usd"

            );



            this.polUsd =
            response.data
            ["polygon-ecosystem-token"]
            .usd;



            return this.polUsd;



        }
        catch(error){


            console.error(
                "POL price error:",
                error
            );


            throw error;


        }


    }







    //-----------------------------------------
    // Convert POL to Currency
    //-----------------------------------------

    async convertPOL(
        amountPOL,
        targetCurrency
    ){


        const polUsd =
            await this.getPOLPriceUSD();



        const rates =
            await this.loadRates("USD");



        const currencyRate =
            rates[targetCurrency];



        if(!currencyRate){

            throw new Error(
                "Unsupported currency"
            );

        }



        return Number(

            (
            amountPOL *
            polUsd *
            currencyRate
            )
            .toFixed(2)

        );


    }







    //-----------------------------------------
    // Supported Currencies
    //-----------------------------------------

    getSupportedCurrencies(){


        return [

            "USD",
            "INR",
            "EUR",
            "GBP",
            "AED",
            "JPY",
            "CAD",
            "AUD",
            "SGD"

        ];

    }






    //-----------------------------------------
    // Currency Symbol
    //-----------------------------------------

    getSymbol(currency){


        const symbols={

            USD:"$",
            INR:"₹",
            EUR:"€",
            GBP:"£",
            AED:"د.إ",
            JPY:"¥",
            CAD:"C$",
            AUD:"A$",
            SGD:"S$"

        };


        return symbols[currency]
        ||
        currency;


    }







    //-----------------------------------------
    // Detect Currency
    //-----------------------------------------

    getCurrency(countryCode){


        const map={

            IN:"INR",
            US:"USD",
            GB:"GBP",
            AE:"AED",
            JP:"JPY",
            DE:"EUR",
            FR:"EUR",
            IT:"EUR",
            ES:"EUR",
            CA:"CAD",
            AU:"AUD",
            SG:"SGD"

        };


        return map[countryCode]
        ||
        "USD";


    }



}


export default new ExchangeRateService();