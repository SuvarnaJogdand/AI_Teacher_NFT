import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSubscriptionContract, getNFTContract, } from "../contracts/contracts";


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
    }, []);

    useEffect(() => {

        if (!monthlyPrice || !yearlyPrice) return;

        const calculatePrices = async () => {

            const country =
                localStorage.getItem("country");

            if (!country) return;

            const response =
                await fetch(
                    "http://localhost:5000/api/exchange-rates"
                );

            const data =
                await response.json();

            const currencyMap = {
                India: "INR",
                USA: "USD",
                UK: "GBP",
                Canada: "CAD",
                Japan: "JPY",
            };

            const code =
                currencyMap[country];

            const convertedMonthly =
                Number(monthlyPrice) *
                data.polUsd *
                data.rates[code];

            const convertedYearly =
                Number(yearlyPrice) *
                data.polUsd *
                data.rates[code];

            console.log("Converted Monthly:", convertedMonthly);

            setLocalMonthlyPrice(convertedMonthly);

            setLocalYearlyPrice(convertedYearly);

        };

        calculatePrices();

    }, [monthlyPrice, yearlyPrice]);

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
            console.log(
                "Monthly POL:",
                ethers.formatEther(plan.monthlyPrice)
            );

            console.log(
                "Yearly POL:",
                ethers.formatEther(plan.yearlyPrice)
            );

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

    console.log("TokenId:", tokenId);



    const subscribe = async (yearly) => {
        try {
            const contract = await getSubscriptionContract();

            const plan = await contract.getPlan(tokenId);
            console.log(plan);

            const nftContract = await getNFTContract();

            const owner = await nftContract.ownerOf(tokenId);

            console.log("NFT Owner:", owner);

            const signer = await contract.runner.getAddress();

            console.log("Connected Wallet:", signer);

          

            const price = yearly
                ? plan.yearlyPrice
                : plan.monthlyPrice;

            console.log("Token ID:", tokenId);
            console.log("Yearly:", yearly);
            console.log("Price:", price.toString());

            const tx = await contract.subscribe(tokenId, yearly, {
                value: price,
            });

            console.log("Transaction:", tx);

            await tx.wait();

            alert("Subscription Successful");
        } catch (err) {
            console.error("Subscribe Error:", err);

            if (err.reason) {
                console.log("Reason:", err.reason);
            }

            if (err.shortMessage) {
                console.log("Short Message:", err.shortMessage);
            }

            if (err.data) {
                console.log("Data:", err.data);
            }

            alert("Subscription Failed");
        }
    };


    return (
        <div>
            <h2>Teacher Subscription</h2>

            {/* <p>
                Country:
                {localStorage.getItem("country") || "Not Selected"}
            </p>

            <Link to="/country">
                <button>Change Country</button>
            </Link> */}

            <br />
            <br />

            <p>
                Monthly Price:
                {symbol}
                {localMonthlyPrice.toFixed(2)}
            </p>


            <button
                onClick={() => {
                    console.log("Monthly button clicked");
                    subscribe(false);
                }}
            >
                Subscribe Monthly
            </button>

            <br />
            <br />

            <p>
                Yearly Price:
                {symbol}
                {localYearlyPrice.toFixed(2)}
            </p>


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