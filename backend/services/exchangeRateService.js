import axios from "axios";

class ExchangeRateService {
    constructor() {
        this.cache = {};
        this.lastUpdated = 0;
        this.cacheDuration = 60 * 60 * 1000; // 1 hour
    }

    //-----------------------------------------
    // Load latest exchange rates
    //-----------------------------------------
    async loadRates(base = "USD") {
        const now = Date.now();

        if (
            this.cache[base] &&
            now - this.lastUpdated < this.cacheDuration
        ) {
            return this.cache[base];
        }

        const url =
            `https://open.er-api.com/v6/latest/${base}`;

        const response = await axios.get(url);

        this.cache[base] = response.data.rates;
        this.lastUpdated = now;

        return response.data.rates;
    }

    //-----------------------------------------
    // Convert Currency
    //-----------------------------------------
    async convert(
        amount,
        fromCurrency,
        toCurrency
    ) {
        if (fromCurrency === toCurrency) {
            return amount;
        }

        const rates =
            await this.loadRates(fromCurrency);

        const rate = rates[toCurrency];

        if (!rate) {
            throw new Error(
                "Unsupported currency"
            );
        }

        return Number(
            (amount * rate).toFixed(2)
        );
    }

    //-----------------------------------------
    // Supported Currencies
    //-----------------------------------------
    getSupportedCurrencies() {
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
    getSymbol(currency) {
        const symbols = {
            USD: "$",
            INR: "₹",
            EUR: "€",
            GBP: "£",
            AED: "د.إ",
            JPY: "¥",
            CAD: "C$",
            AUD: "A$",
            SGD: "S$"
        };

        return symbols[currency] || currency;
    }

    //-----------------------------------------
    // Detect Currency from Country
    //-----------------------------------------
    getCurrency(countryCode) {
        const map = {
            IN: "INR",
            US: "USD",
            GB: "GBP",
            AE: "AED",
            JP: "JPY",
            DE: "EUR",
            FR: "EUR",
            IT: "EUR",
            ES: "EUR",
            CA: "CAD",
            AU: "AUD",
            SG: "SGD"
        };

        return map[countryCode] || "USD";
    }
}

export default new ExchangeRateService();