import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

import abi from "../contracts/AITeacherNFT.json";
import { CONTRACT_ADDRESS } from "../contracts/config";
import { Link } from "react-router-dom";

// const params = useParams();

// console.log("Params:", params);

function SubscriptionPage() {

    const { tokenId } = useParams();

    console.log("TokenId from URL =", tokenId);

    const [monthlyPrice, setMonthlyPrice] = useState("0");
    const [yearlyPrice, setYearlyPrice] = useState("0");

    useEffect(() => {
        loadPrices();
    }, []);

    console.log("Calling monthlySubscriptionPrice with:", tokenId);

    const loadPrices = async () => {

        console.log("Loading prices for token:", tokenId);

        if (!tokenId) {
            console.log("TokenId is undefined");
            return;
        }

        const provider =
            new ethers.BrowserProvider(window.ethereum);

        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            abi.abi,
            provider
        );

        const monthly =
            await contract.monthlySubscriptionPrice(tokenId);

        console.log("Monthly:", monthly.toString());

        const yearly =
            await contract.yearlySubscriptionPrice(tokenId);

        console.log("Yearly:", yearly.toString());

        setMonthlyPrice(
            ethers.formatEther(monthly)
        );

        setYearlyPrice(
            ethers.formatEther(yearly)
        );
    };

    console.log("Subscribing with tokenId:", tokenId);

    const subscribe = async (yearly) => {
        try {
            const provider =
                new ethers.BrowserProvider(window.ethereum);

            const signer =
                await provider.getSigner();

            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                abi.abi,
                signer
            );



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
                Monthly Price: {monthlyPrice} POL
            </p>

            <button
                onClick={() => subscribe(false)}
            >
                Subscribe Monthly
            </button>

            <br />
            <br />

            <p>
                Yearly Price: {yearlyPrice} POL
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