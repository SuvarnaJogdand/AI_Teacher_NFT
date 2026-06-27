import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
  createUser,
  getProfile,
} from "../controllers/userController.js";

const router = express.Router();

// Create User
router.post("/", createUser);

// Get Profile
router.get(
  "/profile",
  protect,
  getProfile
);

export default router;