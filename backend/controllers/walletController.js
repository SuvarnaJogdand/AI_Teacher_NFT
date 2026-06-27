import jwt from "jsonwebtoken";
import { ethers } from "ethers";
import crypto from "crypto";

import Wallet from "../models/wallet.js";

// STEP 1
// Generate nonce
export const getNonce = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address required",
      });
    }

    // Secure nonce
    const nonce =
      crypto.randomBytes(16).toString(
        "hex"
      );

    // Find existing wallet
    let user = await Wallet.findOne({
      walletAddress:
        walletAddress.toLowerCase(),
    });

    // Create new wallet
    if (!user) {
      user = await Wallet.create({
        walletAddress:
          walletAddress.toLowerCase(),
        nonce,
      });
    } else {
      // Update nonce
      user.nonce = nonce;

      await user.save();
    }

    console.log("Saved User:", user);

    return res.status(200).json({
      success: true,
      nonce: user.nonce,

      message:
        `Sign this message to login: ${user.nonce}`,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


//Step 2
// export const walletLogin = async (
//   req,
//   res
// ) => {
//   try {
//     const { walletAddress } =
//       req.body;

//     return res.status(200).json({
//       success: true,
//       message: "Wallet Login Working",
//       walletAddress,
//     });
//   } catch (error) {
//     console.log(error);

//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };

export const walletLogin = async (
  req,
  res
) => {
  try {
    const { walletAddress } =
      req.body;

    // Find user
    const user =
      await Wallet.findOne({
        walletAddress:
          walletAddress.toLowerCase(),
      });

    // User not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// get profile
export const getProfile = async (
  req,
  res
) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};