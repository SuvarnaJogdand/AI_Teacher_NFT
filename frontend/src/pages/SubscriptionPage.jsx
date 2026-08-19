import { useParams, Link } from "react-router-dom";
import { ethers } from "ethers";
import { useEffect, useState, useRef } from "react";
import { getSubscriptionContract } from "../contracts/contracts";
import { load } from "@cashfreepayments/cashfree-js";
import { useWallet } from "../context/WalletContext";


function SubscriptionPage() {

    const { tokenId } = useParams();

    const [monthlyPrice, setMonthlyPrice] = useState("0");
    const [yearlyPrice, setYearlyPrice] = useState("0");

    const [polUsd, setPolUsd] = useState(0);

    const [localMonthlyPrice, setLocalMonthlyPrice] = useState(0);
    const [localYearlyPrice, setLocalYearlyPrice] = useState(0);

    const cashfreeRef = useRef(null);

    const { walletAddress } = useWallet();



    // Load Cashfree

    useEffect(() => {

        async function initCashfree() {

            cashfreeRef.current = await load({
                mode: "sandbox",
            });

            console.log("Cashfree loaded");

        }

        initCashfree();

    }, []);





    // Load subscription prices

    useEffect(() => {

        loadPrices();

    }, [tokenId]);





    const loadPrices = async () => {

        try {

            if (!tokenId) {
                console.log("Token id missing");
                return;
            }


            const contract =
                await getSubscriptionContract();


            const plan =
                await contract.getPlan(tokenId);



            const monthly =
                ethers.formatEther(
                    plan.monthlyPrice
                );


            const yearly =
                ethers.formatEther(
                    plan.yearlyPrice
                );



            console.log(
                "Monthly POL:",
                monthly
            );


            console.log(
                "Yearly POL:",
                yearly
            );



            setMonthlyPrice(monthly);

            setYearlyPrice(yearly);



        }
        catch (error) {

            console.error(
                "Price loading error:",
                error
            );

        }

    };







    // POL conversion

    useEffect(() => {


        async function calculatePrices() {

            try {

                const country =
                    localStorage.getItem("country") || "USA";


                // ==========================================
                // GET POL + CURRENCY RATES
                // ==========================================

                const response = await fetch(
                    "http://localhost:5000/api/exchange-rates"
                );


                if (!response.ok) {

                    throw new Error(
                        `Exchange rate API returned ${response.status}`
                    );

                }


                const data =
                    await response.json();


                console.log(
                    "Exchange Data:",
                    data
                );


                // ==========================================
                // COUNTRY → CURRENCY
                // ==========================================

                const currencyMap = {

                    India: "INR",

                    USA: "USD",

                    UK: "GBP",

                    Canada: "CAD",

                    Japan: "JPY",

                    Australia: "AUD",

                    UAE: "AED",

                    Europe: "EUR",

                    Switzerland: "CHF",

                    Singapore: "SGD",

                    NewZealand: "NZD",

                    China: "CNY",

                    SouthKorea: "KRW",

                    Brazil: "BRL",

                    Mexico: "MXN",

                    SouthAfrica: "ZAR",

                    SaudiArabia: "SAR",

                    Qatar: "QAR",

                    Thailand: "THB",

                    Malaysia: "MYR"

                };


                const code =
                    currencyMap[country] || "USD";


                console.log(
                    "Country:",
                    country
                );

                console.log(
                    "Currency:",
                    code
                );


                // ==========================================
                // POL → USD
                // ==========================================

                const polRate =
                    Number(data.polUsd);


                // ==========================================
                // USD → LOCAL CURRENCY
                // ==========================================

                const currencyRate =
                    Number(data.rates[code]);


                if (!polRate || !currencyRate) {

                    throw new Error(
                        `Exchange rate unavailable for ${code}`
                    );

                }


                // ==========================================
                // POL → LOCAL CURRENCY
                // ==========================================

                const monthlyLocal =

                    Number(monthlyPrice)
                    *
                    polRate
                    *
                    currencyRate;


                const yearlyLocal =

                    Number(yearlyPrice)
                    *
                    polRate
                    *
                    currencyRate;


                console.log(
                    "POL/USD:",
                    polRate
                );

                console.log(
                    "USD/" + code + ":",
                    currencyRate
                );

                console.log(
                    "Monthly local:",
                    monthlyLocal
                );

                console.log(
                    "Yearly local:",
                    yearlyLocal
                );


                // ==========================================
                // SAVE PRICES
                // ==========================================

                setLocalMonthlyPrice(
                    monthlyLocal
                );

                setLocalYearlyPrice(
                    yearlyLocal
                );


            } catch (error) {

                console.error(
                    "Currency conversion failed:",
                    error
                );

            }
        }



        if (
            monthlyPrice !== "0" &&
            yearlyPrice !== "0"
        ) {

            calculatePrices();

        }



    }, [
        monthlyPrice,
        yearlyPrice
    ]);








    const symbols = {

        India: "₹",
        USA: "$",
        UK: "£",
        Canada: "C$",
        Japan: "¥"

    };



    const country =
        localStorage.getItem("country")
        || "USA";


    const symbol =
        symbols[country];









    // Payment

    const subscribe = async (planType) => {


        try {


            if (!cashfreeRef.current) {

                alert(
                    "Cashfree not loaded"
                );

                return;

            }



            const amount =

                planType === "MONTHLY"

                    ?
                    localMonthlyPrice

                    :
                    localYearlyPrice;





            console.log("========== CASHFREE REQUEST ==========");
            console.log({
                teacherId: Number(tokenId),
                amount: Number(amount),
                plan: planType,
                studentWallet: walletAddress,
            });

            const response =
                await fetch(
                    "http://localhost:5000/api/payment/create-order",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            teacherId: Number(tokenId),

                            amount,

                            plan: planType,

                            studentWallet: walletAddress,

                            customerName: "Student",

                            customerEmail: "student@test.com",

                            customerPhone: "9999999999"
                        })
                    }
                );





            const data =
                await response.json();



            if (!data.success) {

                alert(
                    "Payment creation failed"
                );

                return;

            }





            await cashfreeRef.current.checkout({

                paymentSessionId:
                    data.paymentSessionId,

                redirectTarget:
                    "_modal"

            });



        }
        catch (error) {

            console.error(
                error
            );

            alert(
                "Payment failed"
            );

        }


    };

    console.log("PRICE DEBUG:", {
        monthlyPrice,
        yearlyPrice,
        polUsd,
        monthlyUSD:
            Number(monthlyPrice) * Number(polUsd),
        yearlyUSD:
            Number(yearlyPrice) * Number(polUsd)
    });








    return (

        <div>


            <h2>
                Teacher Subscription
            </h2>



            <hr />




            <h3>
                Monthly Plan
            </h3>

            <p>
                Monthly Price:

                <br />

                <strong>
                    {symbol}
                    {localMonthlyPrice.toFixed(2)}
                </strong>

            </p>


            <button
                onClick={() => subscribe("MONTHLY")}
            >
                Subscribe Monthly
            </button>


            <hr />


            <h3>
                Yearly Plan
            </h3>


            <p>
                Yearly Price:

                <br />

                <strong>
                    {symbol}
                    {localYearlyPrice.toFixed(2)}
                </strong>

            </p>


            <button
                onClick={() => subscribe("YEARLY")}
            >
                Subscribe Yearly
            </button>





            <br />
            <br />



            <Link to="/">

                <button>
                    ← Back to Home
                </button>

            </Link>



        </div>

    );

}


export default SubscriptionPage;