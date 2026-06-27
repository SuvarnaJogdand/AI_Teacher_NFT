import NFT from "../models/NFT.js";

export const createNFT = async (req, res) => {
  try {
    const nft = await NFT.create(req.body);

    res.status(201).json(nft);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getNFTs = async (req, res) => {
  try {
    const nfts = await NFT.find();

    res.json(nfts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};