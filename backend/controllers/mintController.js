import { ethers } from "ethers";
import NFT from "../models/nft.js";

// import contractABI from "../abi/AITeacherNFT.json" assert { type: "json" };
import fs from "fs";

const contractABI = JSON.parse(
  fs.readFileSync(
    new URL(
      "../abi/AITeacherNFT.json",
      import.meta.url
    )
  )
);

export const mintTeacherNFT = async (
  req,
  res
) => {
  try {
    const {
      nftId,
      walletAddress,
    } = req.body;

    // Find NFT
    const nft = await NFT.findById(
      nftId
    );

    if (!nft) {
      return res.status(404).json({
        success: false,
        message: "NFT not found",
      });
    }

    // Check metadata exists
    if (!nft.metadataUrl) {
      return res.status(400).json({
        success: false,
        message:
          "Metadata not uploaded",
      });
    }

    // Provider
    const provider =
      new ethers.JsonRpcProvider(
        process.env.RPC_URL
      );

    // Owner wallet
    const wallet = new ethers.Wallet(
      process.env.PRIVATE_KEY,
      provider
    );

    // Contract
    const contract = new ethers.Contract(
      process.env.NFT_CONTRACT,
      contractABI.abi,
      wallet
    );

    // Mint Teacher NFT
    const tx =
      await contract.mintTeacher(
        walletAddress,
        nft.title,
        "Mathematics", // specialization
        nft.metadataUrl
      );

    // Wait transaction
    const receipt = await tx.wait();

    // Token ID
    const tokenId =
      receipt.logs[0].args.tokenId.toString();

    // Save in MongoDB
    nft.tokenId = tokenId;

    nft.txHash = tx.hash;

    nft.ownerWallet =
      walletAddress;

    await nft.save();

    return res.status(200).json({
      success: true,
      tokenId,
      txHash: tx.hash,
      nft,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};