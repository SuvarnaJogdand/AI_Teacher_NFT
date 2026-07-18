import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSubscriptionContract, } from "../contracts/contracts";


// const params = useParams();

// console.log("Params:", params);

function SubscriptionPage() {

    const { tokenId } = useParams();

    console.log("TokenId from URL =", tokenId);

    const [monthlyPrice, setMonthlyPrice] = useState("0");
    const [yearlyPrice, setYearlyPrice] = useState("0");
    const [localMonthlyPrice, setLocalMonthlyPrice] = useState(0);
    const [localYearlyPrice, setLocalYearlyPrice] = useState(0);


    useEffect(() => {
        loadPrices();

        const calculatePrices = async () => {

            const country =
                localStorage.getItem("country");

            if (!country) return;

            const response = await fetch(
                "http://localhost:5000/api/exchange-rates"
            );

            const data = await response.json();

            const polUsd = data.polUsd;

            const currencyMap = {
                India: "INR",
                USA: "USD",
                UK: "GBP",
                Canada: "CAD",
                Japan: "JPY",
            };

            const currencyCode =
                currencyMap[country];

            const exchangeRate =
                data.rates[currencyCode];

            const monthly =
                Number(monthlyPrice) *
                polUsd *
                exchangeRate;

            const yearly =
                Number(yearlyPrice) *
                polUsd *
                exchangeRate;

            setLocalMonthlyPrice(monthly);

            setLocalYearlyPrice(yearly);
        };

        calculatePrices();
    }, []);

    const symbols = {
        India: "₹",
        USA: "$",
        UK: "£",
        Canada: "C$",
        Japan: "¥",
    };

    const country =
        localStorage.getItem("country");

    const symbol =
        symbols[country];

    console.log("Calling monthlySubscriptionPrice with:", tokenId);

    const loadPrices = async () => {
        try {
            console.log("Loading prices for token:", tokenId);

            if (!tokenId) {
                console.log("TokenId is undefined");
                return;
            }

            const subscriptionContract =
                await getSubscriptionContract();

            const plan =
                await subscriptionContract.getPlan(
                    tokenId
                );

            console.log("Plan:", plan);

            setMonthlyPrice(
                ethers.formatEther(
                    plan.monthlyPrice
                )
            );

            setYearlyPrice(
                ethers.formatEther(
                    plan.yearlyPrice
                )
            );

        } catch (error) {
            console.error(error);
        }
    };

    console.log("TokenId:", tokenId);
    console.log("Monthly:", monthlyPrice);
    console.log("Yearly:", yearlyPrice);

    const subscribe = async (yearly) => {

        const userCountry =
            localStorage.getItem("country");

        if (!userCountry) {
            alert(
                "Please select your country before subscribing."
            );

            window.location.href = "/country";

            return;
        }

        try {

            const contract =
                await getSubscriptionContract();

            const price = yearly
                ? await contract.yearlySubscriptionPrice(tokenId)
                : await contract.monthlySubscriptionPrice(tokenId);

            const tx =
                await contract.subscribeTeacher(
                    tokenId,
                    yearly,
                    {
                        value: price,
                    }
                );

            await tx.wait();

            alert("Subscription Successful");

        } catch (err) {
            console.log(err);
            alert("Subscription Failed");
        }
    };



    return (
        <div>
            <h2>Teacher Subscription</h2>

            <p>
                Country:
                {localStorage.getItem("country") || "Not Selected"}
            </p>

            <Link to="/country">
                <button>Change Country</button>
            </Link>

            <p>
                Monthly Price:
                {symbol}
                {localMonthlyPrice.toFixed(2)}
            </p>

            <p>
                Yearly Price:
                {symbol}
                {localYearlyPrice.toFixed(2)}
            </p>

            <button
                onClick={() => subscribe(false)}
            >
                Subscribe Monthly
            </button>

            <br />
            <br />

            

            <button
                onClick={() => subscribe(true)}
            >
                Subscribe Yearly
            </button>
            <br />
            <br />



            <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Link to="/">
                    <button>← Back to Home</button>
                </Link>
            </div>
        </div>
    );
}

export default SubscriptionPage;