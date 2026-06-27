import express from "express";

import {
  createNFT,
  getNFTs,
} from "../controllers/nftController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createNFT)
  .get(getNFTs);

export default router;