import User from "../models/User.js";
//import Wallet from "../models/Wallet.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, walletAddress } = req.body;

    const user = await User.create({
      name,
      email,
      walletAddress,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
 // for getting Profile
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