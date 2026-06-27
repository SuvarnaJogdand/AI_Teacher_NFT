import mongoose from "mongoose";

const nftSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    imageIpfsHash: {
      type: String,
      required: true,
    },

    metadataUrl: {
      type: String,
    },

    metadataIpfsHash: {
      type: String,
    },

    tokenId: {
      type: Number,
    },

    txHash: {
      type: String,
    },

    ownerWallet: {
      type: String,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

const NFT =
  mongoose.models.NFT ||
  mongoose.model("NFT", nftSchema);

export default NFT;