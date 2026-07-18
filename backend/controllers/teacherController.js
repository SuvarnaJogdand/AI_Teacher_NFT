import { ethers } from "ethers";
import {
    nftContract,
    mintTeacher
} from "../services/blockchainService.js";

// ----------------------------------------
// Mint Teacher NFT
// ----------------------------------------

export const createTeacher = async (req, res) => {
    try {
        const {
            walletAddress,
            name,
            subject,
            topic,
            specialization,
            metadataURI,
            mintPrice
        } = req.body;

        if (
            !walletAddress ||
            !name ||
            !subject ||
            !topic ||
            !specialization ||
            !metadataURI
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const tx = await mintTeacher(
            walletAddress,
            name,
            subject,
            topic,
            specialization,
            metadataURI,
            ethers.parseEther(mintPrice.toString())
        );

        res.status(201).json({
            success: true,
            message: "Teacher NFT minted successfully",
            transactionHash: tx.hash
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ----------------------------------------
// Get Teacher
// ----------------------------------------

export const getTeacher = async (req, res) => {

    try {

        const { tokenId } = req.params;

        const teacher =
            await nftContract.getTeacher(tokenId);

        const owner =
            await nftContract.ownerOf(tokenId);

        const uri =
            await nftContract.tokenURI(tokenId);

        const skills =
            await nftContract.getSkills(tokenId);

        res.json({
            success: true,
            teacher,
            owner,
            metadataURI: uri,
            skills
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ----------------------------------------
// Total Supply
// ----------------------------------------

export const totalTeachers = async (req, res) => {

    try {

        const total =
            await nftContract.totalSupply();

        res.json({
            success: true,
            total: Number(total)
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ----------------------------------------
// Get All Teachers
// ----------------------------------------

export const getAllTeachers = async (req, res) => {

    try {

        const total =
            Number(await nftContract.totalSupply());

        const teachers = [];

        for (let i = 1; i <= total; i++) {

            try {

                const teacher =
                    await nftContract.getTeacher(i);

                const owner =
                    await nftContract.ownerOf(i);

                const uri =
                    await nftContract.tokenURI(i);

                teachers.push({
                    tokenId: i,
                    owner,
                    metadataURI: uri,
                    ...teacher
                });

            } catch (err) {

                console.log(
                    "Skipping token",
                    i
                );

            }

        }

        res.json({
            success: true,
            count: teachers.length,
            teachers
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ----------------------------------------
// Add Skill
// ----------------------------------------

export const addSkill = async (req, res) => {

    try {

        const {
            tokenId,
            skill
        } = req.body;

        const tx =
            await nftContract.addSkill(
                tokenId,
                skill
            );

        await tx.wait();

        res.json({
            success: true,
            message: "Skill added",
            transactionHash: tx.hash
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ----------------------------------------
// Get Skills
// ----------------------------------------

export const getSkills = async (req, res) => {

    try {

        const { tokenId } =
            req.params;

        const skills =
            await nftContract.getSkills(
                tokenId
            );

        res.json({
            success: true,
            skills
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};