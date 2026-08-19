import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ethers } from "ethers";

import { useWallet } from "../context/WalletContext";

import nftAbi from "../contracts/AITeacherNFT.json";
import marketplaceAbi from "../contracts/TeacherMarketplace.json";
import rentalAbi from "../contracts/TeacherRental.json";
import subscriptionAbi from "../contracts/TeacherSubscription.json";

import {
    NFT_CONTRACT,
    MARKETPLACE_CONTRACT,
    RENTAL_CONTRACT,
    SUBSCRIPTION_CONTRACT,
} from "../contracts/config";

function ManageTeacherDetails() {
    const { tokenId } = useParams();
    const { account } = useWallet();

    const [teacher, setTeacher] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [salePrice, setSalePrice] = useState("");
    const [rentPrice, setRentPrice] = useState("");

    const [monthlyPrice, setMonthlyPrice] = useState("");
    const [yearlyPrice, setYearlyPrice] = useState("");

    const [processing, setProcessing] = useState(false);

    // --------------------------------------------------
    // LOAD TEACHER
    // --------------------------------------------------

    const loadTeacher = async () => {
        try {
            setLoading(true);
            setError("");

            if (!window.ethereum) {
                throw new Error("Please install MetaMask.");
            }

            if (!account) {
                throw new Error("Please connect your wallet.");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);

            const nftContract = new ethers.Contract(
                NFT_CONTRACT,
                nftAbi.abi || nftAbi,
                provider
            );

            const numericTokenId = Number(tokenId);

            if (!Number.isInteger(numericTokenId) || numericTokenId <= 0) {
                throw new Error("Invalid token ID.");
            }

            console.log("Loading teacher:", numericTokenId);

            // Get teacher information
            const result = await nftContract.getTeacher(numericTokenId);

            console.log("getTeacher result:", result);

            const info = result[0];
            const market = result[1];
            const stats = result[2];

            // Check owner
            const owner = await nftContract.ownerOf(numericTokenId);

            console.log("NFT owner:", owner);
            console.log("Connected account:", account);

            if (owner.toLowerCase() !== account.toLowerCase()) {
                throw new Error(
                    "You are not the owner of this Teacher NFT."
                );
            }

            setTeacher({
                tokenId: numericTokenId,

                name: info.name,
                subject: info.subject,
                description: info.description,
                experience: info.experience,
                metadataURI: info.metadataURI,

                mintPrice: ethers.formatEther(info.price || 0),

                isForSale: market.isForSale,
                salePrice: ethers.formatEther(market.salePrice || 0),

                isForRent: market.isForRent,
                rentPrice: ethers.formatEther(market.rentPrice || 0),

                totalSales: stats.totalSales?.toString() || "0",
                totalRentals: stats.totalRentals?.toString() || "0",
                totalRevenue: ethers.formatEther(
                    stats.totalRevenue || 0
                ),
            });

            setSalePrice(
                market.salePrice
                    ? ethers.formatEther(market.salePrice)
                    : ""
            );

            setRentPrice(
                market.rentPrice
                    ? ethers.formatEther(market.rentPrice)
                    : ""
            );
        } catch (err) {
            console.error("ManageTeacherDetails error:", err);

            setError(
                err.reason ||
                err.message ||
                "Unable to load teacher."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadSubscriptionPlan = async () => {
        try {
            if (!window.ethereum || !tokenId) return;

            const provider = new ethers.BrowserProvider(
                window.ethereum
            );

            const contract = new ethers.Contract(
                SUBSCRIPTION_CONTRACT,
                subscriptionAbi.abi || subscriptionAbi,
                provider
            );

            const plan = await contract.getPlan(Number(tokenId));

            console.log("Subscription plan:", plan);

            setMonthlyPrice(
                plan.monthlyPrice > 0
                    ? ethers.formatEther(plan.monthlyPrice)
                    : ""
            );

            setYearlyPrice(
                plan.yearlyPrice > 0
                    ? ethers.formatEther(plan.yearlyPrice)
                    : ""
            );

            console.log(
                "Subscription enabled:",
                plan.enabled
            );

        } catch (err) {
            console.error(
                "Failed to load subscription plan:",
                err
            );
        }
    };

    useEffect(() => {
        if (account && tokenId) {
            loadTeacher();
            loadSubscriptionPlan();
        }
    }, [account, tokenId]);

    // --------------------------------------------------
    // LIST FOR SALE
    // --------------------------------------------------

    const listForSale = async () => {
        try {
            if (!salePrice || Number(salePrice) <= 0) {
                alert("Enter a valid sale price.");
                return;
            }

            setProcessing(true);

            const provider = new ethers.BrowserProvider(
                window.ethereum
            );

            const signer = await provider.getSigner();

            const contract = new ethers.Contract(
                MARKETPLACE_CONTRACT,
                marketplaceAbi.abi || marketplaceAbi,
                signer
            );

            const price = ethers.parseEther(salePrice);

            const tx = await contract.listForSale(
                Number(tokenId),
                price
            );

            await tx.wait();

            alert("Teacher listed for sale successfully.");

            await loadTeacher();
        } catch (err) {
            console.error("List sale error:", err);

            alert(
                err.reason ||
                err.message ||
                "Failed to list teacher for sale."
            );
        } finally {
            setProcessing(false);
        }
    };

    // --------------------------------------------------
    // LIST FOR RENT
    // --------------------------------------------------

    const listForRent = async () => {
        try {
            if (!rentPrice || Number(rentPrice) <= 0) {
                alert("Enter a valid rental price.");
                return;
            }

            setProcessing(true);

            const provider = new ethers.BrowserProvider(
                window.ethereum
            );

            const signer = await provider.getSigner();

            const contract = new ethers.Contract(
                RENTAL_CONTRACT,
                rentalAbi.abi || rentalAbi,
                signer
            );

            const price = ethers.parseEther(rentPrice);

            const tx = await contract.listForRent(
                Number(tokenId),
                price
            );

            await tx.wait();

            alert("Teacher listed for rent successfully.");

            await loadTeacher();
        } catch (err) {
            console.error("List rent error:", err);

            alert(
                err.reason ||
                err.message ||
                "Failed to list teacher for rent."
            );
        } finally {
            setProcessing(false);
        }
    };

    // --------------------------------------------------
    // UPDATE SUBSCRIPTION
    // --------------------------------------------------

    const updateSubscription = async () => {
        try {
            if (!monthlyPrice || !yearlyPrice) {
                alert("Enter monthly and yearly prices.");
                return;
            }

            if (
                Number(monthlyPrice) <= 0 ||
                Number(yearlyPrice) <= 0
            ) {
                alert("Prices must be greater than zero.");
                return;
            }

            setProcessing(true);

            const provider = new ethers.BrowserProvider(
                window.ethereum
            );

            const signer = await provider.getSigner();

            const contract = new ethers.Contract(
                SUBSCRIPTION_CONTRACT,
                subscriptionAbi.abi || subscriptionAbi,
                signer
            );

            const monthly = ethers.parseEther(monthlyPrice);
            const yearly = ethers.parseEther(yearlyPrice);

            /*
             * IMPORTANT:
             * The exact function name/signature may be different
             * in your TeacherSubscription.sol.
             *
             * We will adjust this after checking your contract.
             */

            const tx = await contract.setSubscriptionPrice(
                Number(tokenId),
                monthly,
                yearly
            );

            await tx.wait();

            alert("Subscription prices updated.");

        } catch (err) {
            console.error("Subscription update error:", err);

            alert(
                err.reason ||
                err.message ||
                "Failed to update subscription prices."
            );
        } finally {
            setProcessing(false);
        }
    };

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">
                    Loading teacher...
                </p>
            </div>
        );
    }

    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-3xl mx-auto">

                    <div className="bg-red-100 text-red-700 p-5 rounded-xl">
                        <h2 className="font-bold text-lg mb-2">
                            Unable to load Teacher
                        </h2>

                        <p>{error}</p>
                    </div>

                    <Link
                        to="/manage-teacher"
                        className="inline-block mt-5 text-blue-600"
                    >
                        ← Back to Teacher Dashboard
                    </Link>

                </div>
            </div>
        );
    }

    if (!teacher) {
        return null;
    }

    // --------------------------------------------------
    // DASHBOARD
    // --------------------------------------------------

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="max-w-6xl mx-auto">

                {/* BACK */}
                <Link
                    to="/manage-teacher"
                    className="text-blue-600 hover:underline"
                >
                    ← Back to Teacher Dashboard
                </Link>

                {/* HEADER */}
                <div className="bg-white rounded-xl shadow-md p-6 mt-5">

                    <div className="flex flex-col md:flex-row gap-6">

                        {/* IMAGE */}
                        <div className="w-full md:w-64 h-64 bg-gray-200 rounded-xl overflow-hidden">

                            {teacher.metadataURI ? (
                                <img
                                    src={teacher.metadataURI}
                                    alt={teacher.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}

                        </div>

                        {/* INFORMATION */}
                        <div className="flex-1">

                            <div className="flex justify-between">

                                <div>
                                    <h1 className="text-3xl font-bold">
                                        {teacher.name}
                                    </h1>

                                    <p className="text-blue-600 text-lg">
                                        {teacher.subject}
                                    </p>
                                </div>

                                <span className="bg-gray-100 px-3 py-2 rounded-lg h-fit">
                                    NFT #{teacher.tokenId}
                                </span>

                            </div>

                            <p className="text-gray-600 mt-4">
                                {teacher.description}
                            </p>

                            <p className="mt-3">
                                <strong>Experience:</strong>{" "}
                                {teacher.experience} years
                            </p>

                            <p className="mt-2">
                                <strong>Mint Price:</strong>{" "}
                                {teacher.mintPrice} POL
                            </p>

                        </div>

                    </div>

                </div>

                {/* MARKETPLACE */}
                <div className="bg-white rounded-xl shadow-md p-6 mt-6">

                    <h2 className="text-2xl font-bold mb-5">
                        Marketplace
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">

                        {/* SALE */}
                        <div className="border rounded-xl p-5">

                            <h3 className="text-xl font-semibold">
                                Sell Teacher NFT
                            </h3>

                            <p className="text-gray-500 text-sm mt-1">
                                {teacher.isForSale
                                    ? `Currently listed for ${teacher.salePrice} POL`
                                    : "This teacher is not listed for sale."}
                            </p>

                            <input
                                type="number"
                                step="0.0001"
                                placeholder="Sale price in POL"
                                value={salePrice}
                                onChange={(e) =>
                                    setSalePrice(e.target.value)
                                }
                                className="w-full border rounded-lg p-3 mt-4"
                            />

                            <button
                                onClick={listForSale}
                                disabled={processing}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg mt-3 disabled:opacity-50"
                            >
                                {processing
                                    ? "Processing..."
                                    : teacher.isForSale
                                        ? "Update Sale Listing"
                                        : "List For Sale"}
                            </button>

                        </div>

                        {/* RENT */}
                        <div className="border rounded-xl p-5">

                            <h3 className="text-xl font-semibold">
                                Rent Teacher NFT
                            </h3>

                            <p className="text-gray-500 text-sm mt-1">
                                {teacher.isForRent
                                    ? `Currently ${teacher.rentPrice} POL`
                                    : "This teacher is not available for rent."}
                            </p>

                            <input
                                type="number"
                                step="0.0001"
                                placeholder="Rental price in POL"
                                value={rentPrice}
                                onChange={(e) =>
                                    setRentPrice(e.target.value)
                                }
                                className="w-full border rounded-lg p-3 mt-4"
                            />

                            <button
                                onClick={listForRent}
                                disabled={processing}
                                className="w-full bg-purple-600 text-white py-3 rounded-lg mt-3 disabled:opacity-50"
                            >
                                {processing
                                    ? "Processing..."
                                    : teacher.isForRent
                                        ? "Update Rental"
                                        : "List For Rent"}
                            </button>

                        </div>

                    </div>

                </div>

                {/* SUBSCRIPTION */}
                <div className="bg-white rounded-xl shadow-md p-6 mt-6">

                    <h2 className="text-2xl font-bold mb-2">
                        Subscription
                    </h2>

                    <p className="text-gray-500 mb-5">
                        Set the subscription prices for this AI Teacher.
                    </p>

                    <div className="grid md:grid-cols-2 gap-5">

                        <div>
                            <label className="block font-medium mb-2">
                                Monthly Price
                            </label>

                            <input
                                type="number"
                                step="0.0001"
                                placeholder="Monthly price in POL"
                                value={monthlyPrice}
                                onChange={(e) =>
                                    setMonthlyPrice(e.target.value)
                                }
                                className="w-full border rounded-lg p-3"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2">
                                Yearly Price
                            </label>

                            <input
                                type="number"
                                step="0.0001"
                                placeholder="Yearly price in POL"
                                value={yearlyPrice}
                                onChange={(e) =>
                                    setYearlyPrice(e.target.value)
                                }
                                className="w-full border rounded-lg p-3"
                            />
                        </div>

                    </div>

                    <button
                        onClick={updateSubscription}
                        disabled={processing}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg mt-5 disabled:opacity-50"
                    >
                        {processing
                            ? "Processing..."
                            : "Update Subscription Prices"}
                    </button>

                </div>

                {/* STATISTICS */}
                <div className="bg-white rounded-xl shadow-md p-6 mt-6">

                    <h2 className="text-2xl font-bold mb-5">
                        Statistics
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className="bg-gray-50 rounded-xl p-5 text-center">
                            <p className="text-3xl font-bold">
                                {teacher.totalSales}
                            </p>

                            <p className="text-gray-500">
                                Total Sales
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-5 text-center">
                            <p className="text-3xl font-bold">
                                {teacher.totalRentals}
                            </p>

                            <p className="text-gray-500">
                                Total Rentals
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-5 text-center">
                            <p className="text-3xl font-bold">
                                {teacher.totalRevenue}
                            </p>

                            <p className="text-gray-500">
                                Total Revenue
                            </p>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default ManageTeacherDetails;