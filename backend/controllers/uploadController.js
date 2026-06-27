import axios from "axios";
import FormData from "form-data";
import NFT from "../models/nft.js";

export const uploadImage = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const formData = new FormData();

    formData.append(
      "file",
      req.file.buffer,
      req.file.originalname
    );

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
      }
    );

    const ipfsHash =
      response.data.IpfsHash;

    const imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    // SAVE NFT IN MONGODB
    const nft = await NFT.create({
      title: req.body.title,
      description: req.body.description,

      imageUrl,
      imageIpfsHash: ipfsHash,

      ownerWallet:
        req.body.walletAddress,
    });

    return res.status(200).json({
      success: true,
      nft,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};