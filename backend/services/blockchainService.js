import { ethers } from "ethers";
import dotenv from "dotenv";

import AITeacherNFT from "../../artifacts/contracts/AITeacherNFT.sol/AITeacherNFT.json" with { type: "json" };
import TeacherMarketplace from "../../artifacts/contracts/market/TeacherMarketplace.sol/TeacherMarketplace.json" with { type: "json" };
import TeacherRental from "../../artifacts/contracts/rental/TeacherRental.sol/TeacherRental.json" with { type: "json" };
import TeacherSubscription from "../../artifacts/contracts/subscription/TeacherSubscription.sol/TeacherSubscription.json" with { type: "json" };
import PaymentManager from "../../artifacts/contracts/payment/PaymentManager.sol/PaymentManager.json" with { type: "json" };

dotenv.config();

// ---------------------------------------------
// Provider & Signer
// ---------------------------------------------

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    provider
);

// ---------------------------------------------
// Contracts
// ---------------------------------------------

export const nftContract = new ethers.Contract(
    process.env.NFT_CONTRACT,
    AITeacherNFT.abi,
    wallet
);

export const marketplaceContract = new ethers.Contract(
    process.env.MARKETPLACE_CONTRACT,
    TeacherMarketplace.abi,
    wallet
);

export const rentalContract = new ethers.Contract(
    process.env.RENTAL_CONTRACT,
    TeacherRental.abi,
    wallet
);

export const subscriptionContract = new ethers.Contract(
    process.env.SUBSCRIPTION_CONTRACT,
    TeacherSubscription.abi,
    wallet
);

export const paymentManagerContract = new ethers.Contract(
    process.env.PAYMENT_MANAGER,
    PaymentManager.abi,
    wallet
);

// ---------------------------------------------
// Blockchain Connection
// ---------------------------------------------

export async function checkConnection() {

    const network = await provider.getNetwork();

    console.log("==================================");
    console.log("Blockchain Connected");
    console.log("Chain ID :", network.chainId.toString());
    console.log("==================================");

    return network;
}

// ---------------------------------------------
// Mint Teacher NFT
// ---------------------------------------------

export async function mintTeacher(
    to,
    name,
    subject,
    topic,
    specialization,
    metadataURI,
    mintPrice
) {

    const tx = await nftContract.mintTeacher(
        to,
        name,
        subject,
        topic,
        specialization,
        metadataURI,
        mintPrice
    );

    return await tx.wait();
}

// ---------------------------------------------
// Marketplace
// ---------------------------------------------

export async function listNFT(tokenId, price) {

    const tx = await marketplaceContract.listNFT(
        tokenId,
        price
    );

    return await tx.wait();
}

export async function buyNFT(tokenId, price) {

    const tx = await marketplaceContract.buyNFT(
        tokenId,
        {
            value: price
        }
    );

    return await tx.wait();
}

// ---------------------------------------------
// Rental
// ---------------------------------------------

export async function listForRent(
    tokenId,
    pricePerDay
) {

    const tx = await rentalContract.listForRent(
        tokenId,
        pricePerDay
    );

    return await tx.wait();
}

export async function activateRental(
    paymentId,
    tokenId,
    renter,
    daysCount,
    amount
) {
    const tx = await rentalContract.activateRental(
        paymentId,
        tokenId,
        renter,
        daysCount,
        amount
    );

    return await tx.wait();
}

export async function rentTeacher(
    tokenId,
    daysCount,
    totalPrice
) {

    const tx = await rentalContract.rentTeacher(
        tokenId,
        daysCount,
        {
            value: totalPrice
        }
    );

    return await tx.wait();
}

// ---------------------------------------------
// Subscription
// ---------------------------------------------

export async function setSubscriptionPrice(
    tokenId,
    monthly,
    yearly
) {

    const tx =
        await subscriptionContract.setSubscriptionPrice(
            tokenId,
            monthly,
            yearly
        );

    return await tx.wait();
}

export async function subscribeTeacher(
    tokenId,
    yearly,
    amount
) {
    const tx =
        await subscriptionContract.subscribeTeacher(
            tokenId,
            yearly,
            {
                value: amount
            }
        );

    await tx.wait();
    return tx;
}

// ---------------------------------------------
// Fiat Activation
// ---------------------------------------------

export async function activateSubscription(
    paymentId,
    tokenId,
    student,
    duration,
    amount
) {

    const tx =
        await subscriptionContract.activateSubscription(
            paymentId,
            tokenId,
            student,
            duration,
            amount
        );

    return await tx.wait();
}

// ---------------------------------------------
// Payment Manager
// ---------------------------------------------

export async function recordPayment(
    paymentId,
    tokenId,
    student,
    amount,
    paymentType
) {

    const tx =
        await paymentManagerContract.recordPayment(
            paymentId,
            tokenId,
            student,
            amount,
            paymentType
        );

    return await tx.wait();
}

export async function cancelListing(tokenId) {

    const tx =
        await marketplaceContract.cancelListing(
            tokenId
        );

    return await tx.wait();

}

export async function getListing(tokenId) {

    return await marketplaceContract.getListing(
        tokenId
    );

}

export async function cancelRent(tokenId) {
    const tx = await rentalContract.cancelRent(tokenId);
    return await tx.wait();
}

export async function getRental(tokenId) {
    return await rentalContract.getRental(tokenId);
}

export async function getRentalExpiry(tokenId, user) {
    return await rentalContract.getRentalExpiry(tokenId, user);
}

export async function hasRentalAccess(tokenId, user) {
    return await rentalContract.hasAccess(tokenId, user);
}

export async function getSubscriptionPlan(tokenId) {
    return await subscriptionContract.getPlan(tokenId);
}

export async function hasSubscription(tokenId, user) {
    return await subscriptionContract.hasSubscription(
        tokenId,
        user
    );
}

export async function getSubscriptionExpiry(tokenId, user) {
    return await subscriptionContract.getExpiry(
        tokenId,
        user
    );
}


    // ---------------------------------------------
    // Fiat NFT Purchase
    // ---------------------------------------------

    export async function completePurchase(
        paymentId,
        tokenId,
        buyer,
        amount
    ) {
        const tx = await marketplaceContract.completePurchase(
            paymentId,
            tokenId,
            buyer,
            amount
        );

        await tx.wait();

        return tx;
    }
