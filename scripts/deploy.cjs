const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("=========================================");
    console.log(" AI Teacher Marketplace Deployment");
    console.log("=========================================");

    console.log("Deployer :", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);

    console.log(
        "Balance  :",
        hre.ethers.formatEther(balance),
        "POL"
    );

    console.log("-----------------------------------------");

    //
    // 1. Deploy NFT
    //
    console.log("Deploying AITeacherNFT...");

    const NFT = await hre.ethers.getContractFactory("AITeacherNFT");

    const nft = await NFT.deploy();

    await nft.waitForDeployment();

    const nftAddress = await nft.getAddress();

    console.log("AITeacherNFT:", nftAddress);

    //
    // 2. Deploy PaymentManager
    //
    console.log("-----------------------------------------");

    console.log("Deploying PaymentManager...");

    const PaymentManager =
        await hre.ethers.getContractFactory("PaymentManager");

    const paymentManager =
        await PaymentManager.deploy();

    await paymentManager.waitForDeployment();

    const paymentManagerAddress =
        await paymentManager.getAddress();

    console.log("PaymentManager:", paymentManagerAddress);

    //
    // 3. Deploy Marketplace
    //
    console.log("-----------------------------------------");

    console.log("Deploying TeacherMarketplace...");

    const Marketplace =
        await hre.ethers.getContractFactory(
            "TeacherMarketplace"
        );

    const marketplace =
        await Marketplace.deploy(nftAddress);

    await marketplace.waitForDeployment();

    const marketplaceAddress =
        await marketplace.getAddress();

    //
    // 4. Deploy Rental
    //
    console.log("-----------------------------------------");

    console.log("Deploying TeacherRental...");

    const Rental =
        await hre.ethers.getContractFactory(
            "TeacherRental"
        );

    const rental =
        await Rental.deploy(nftAddress);

    await rental.waitForDeployment();

    const rentalAddress =
        await rental.getAddress();

    //
    // 5. Deploy Subscription
    //
    console.log("-----------------------------------------");

    console.log("Deploying TeacherSubscription...");

    const Subscription =
        await hre.ethers.getContractFactory(
            "TeacherSubscription"
        );

    const subscription =
        await Subscription.deploy(
            nftAddress,
            paymentManagerAddress
        );

    await subscription.waitForDeployment();

    const subscriptionAddress =
        await subscription.getAddress();

    //
    // 6. Configure PaymentManager
    //
    console.log("-----------------------------------------");

    console.log("Authorizing deployer...");

    let tx =
        await paymentManager.addAuthorizedService(
            deployer.address
        );

    await tx.wait();

    console.log("Authorized.");

    console.log("=========================================");
    console.log("DEPLOYMENT COMPLETE");
    console.log("=========================================");

    console.log("AITeacherNFT        :", nftAddress);
    console.log("PaymentManager      :", paymentManagerAddress);
    console.log("TeacherMarketplace :", marketplaceAddress);
    console.log("TeacherRental      :", rentalAddress);
    console.log("TeacherSubscription:", subscriptionAddress);

    console.log("=========================================");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });