import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// ==========================================
// GENERATE JWT TOKEN
// ==========================================

const generateToken = (user) => {

    return jwt.sign(
        {
            id: user._id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};



// ==========================================
// REGISTER USER
// ==========================================

export const registerUser = async (req, res) => {

    try {

        console.log(req.body);

        const {
            name,
            email,
            password,
            walletAddress
        } = req.body;


        // VALIDATION
        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }


        // CHECK EXISTING USER
        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }


        // HASH PASSWORD
        const hashedPassword =
            await bcrypt.hash(password, 10);


        // CREATE USER
        const user = await User.create({

            name,
            email,
            password: hashedPassword,
            walletAddress

        });


        // GENERATE TOKEN
        const token = generateToken(user);


        // RESPONSE
        res.status(201).json({

            success: true,
            message: "User registered successfully",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                walletAddress: user.walletAddress
            }
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: error.message
        });
    }
};




// ==========================================
// LOGIN USER
// ==========================================

export const loginUser = async (req, res) => {

    try {

        console.log(req.body);

        const {
            email,
            password
        } = req.body;


        // VALIDATION
        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }


        // FIND USER
        const user = await User.findOne({
            email
        });

        if (!user) {

            return res.status(404).json({

                success: false,
                message: "User not found"
            });
        }


        // CHECK PASSWORD EXISTS
        if (!user.password) {

            return res.status(400).json({

                success: false,
                message: "Password not found for this user"
            });
        }


        // COMPARE PASSWORD
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {

            return res.status(400).json({

                success: false,
                message: "Invalid credentials"
            });
        }


        // GENERATE TOKEN
        const token = generateToken(user);


        // RESPONSE
        res.status(200).json({

            success: true,
            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                walletAddress: user.walletAddress
            }
        });

        } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: error.message
        });
    }


    // } catch (error) {

    //     console.log(error);

    //     res.status(500).json({

    //         success: false,
    //         message: error.message
    //     });
    // }
};