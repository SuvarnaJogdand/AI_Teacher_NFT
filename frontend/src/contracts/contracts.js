import { ethers } from "ethers";

import nftAbi from "./AITeacherNFT.json";
import marketplaceAbi from "./TeacherMarketplace.json";
import rentalAbi from "./TeacherRental.json";
import subscriptionAbi from "./TeacherSubscription.json";
import paymentManagerAbi from "./PaymentManager.json";



// =====================================
// CONTRACT ADDRESSES
// =====================================

export const NFT_CONTRACT =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const MARKETPLACE_CONTRACT =
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

export const RENTAL_CONTRACT =
    "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

export const SUBSCRIPTION_CONTRACT =
    "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

export const PAYMENTMANAGER_CONTRACT =
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// =====================================
// GET PROVIDER
// =====================================

export const getProvider = () => {
    return new ethers.BrowserProvider(
        window.ethereum
    );
};

// =====================================
// GET SIGNER
// =====================================

export const getSigner = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);

    const accounts = await provider.send("eth_accounts", []);

    console.log("MetaMask accounts:", accounts);

    const signer = await provider.getSigner(accounts[0]);

    console.log("Using signer:", await signer.getAddress());

    return signer;
};

// =====================================
// NFT CONTRACT
// =====================================

export const getNFTContract = async () => {
    const signer = await getSigner();

    return new ethers.Contract(
        NFT_CONTRACT,
        nftAbi.abi,
        signer
    );
};

// =====================================
// MARKETPLACE CONTRACT
// =====================================

export const getMarketplaceContract =
    async () => {
        const signer = await getSigner();

        return new ethers.Contract(
            MARKETPLACE_CONTRACT,
            marketplaceAbi.abi,
            signer
        );
    };

// =====================================
// RENTAL CONTRACT
// =====================================

export const getRentalContract =
    async () => {
        const signer = await getSigner();

        return new ethers.Contract(
            RENTAL_CONTRACT,
            rentalAbi.abi,
            signer
        );
    };

// =====================================
// SUBSCRIPTION CONTRACT
// =====================================

export const getSubscriptionContract =
    async () => {
        const signer = await getSigner();

        return new ethers.Contract(
            SUBSCRIPTION_CONTRACT,
            subscriptionAbi.abi,
            signer
        );
    };

// =====================================
// PAYMENT MANAGER CONTRACT
// =====================================

export const getPaymentManagerContract =
    async () => {
        const signer = await getSigner();

        return new ethers.Contract(
            PAYMENTMANAGER_CONTRACT,
            paymentManagerAbi.abi,
            signer
        );
    };
