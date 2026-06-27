import express from "express";

import {
  mintTeacherNFT,
} from "../controllers/mintController.js";

const router = express.Router();

router.post(
  "/mint-teacher",
  mintTeacherNFT
);

export default router;