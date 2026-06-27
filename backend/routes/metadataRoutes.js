import express from "express";

import {
  uploadMetadata,
} from "../controllers/metadataController.js";

const router = express.Router();

router.post(
  "/upload-metadata",
  uploadMetadata
);

export default router;