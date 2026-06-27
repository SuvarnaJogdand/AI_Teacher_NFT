import axios from "axios";
import NFT from "../models/nft.js";

export const uploadMetadata = async (
  req,
  res
) => {
  try {
    const {
      nftId,
      title,
      description,
      imageUrl,
    } = req.body;

    const metadata = {
      name: title,
      description,
      image: imageUrl,
    };

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
          "Content-Type":
            "application/json",
        },
      }
    );

    const metadataIpfsHash =
      response.data.IpfsHash;

    const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataIpfsHash}`;

    const updatedNFT =
      await NFT.findByIdAndUpdate(
        nftId,
        {
          metadataUrl,
          metadataIpfsHash,
        },
        { new: true }
      );

    return res.status(200).json({
      success: true,
      metadataUrl,
      metadataIpfsHash,
      nft: updatedNFT,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};