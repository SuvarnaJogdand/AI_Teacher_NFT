import express from "express";
import Review from "../models/Review.js";

const router = express.Router();

// Test
router.get("/test", (req, res) => {
    res.json({
        message: "Review route working"
    });
});

// Add review
router.post("/", async (req, res) => {

    try {

        const {
            tokenId,
            student,
            rating,
            comment
        } = req.body;

        const review = new Review({
            tokenId: Number(tokenId),
            student,
            rating: Number(rating),
            comment
        });

        await review.save();

        res.status(201).json({
            success: true,
            review
        });

    } catch (error) {

        console.error("Add review error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Rating summary
router.get("/rating/:tokenId", async (req, res) => {

    try {

        const tokenId = Number(req.params.tokenId);

        if (isNaN(tokenId)) {
            return res.status(400).json({
                message: "Invalid tokenId"
            });
        }

        const reviews = await Review.find({
            tokenId
        });

        if (reviews.length === 0) {

            return res.json({
                average: 0,
                count: 0
            });
        }

        const total = reviews.reduce(
            (sum, review) => sum + Number(review.rating),
            0
        );

        res.json({
            average: Number(
                (total / reviews.length).toFixed(1)
            ),
            count: reviews.length
        });

    } catch (error) {

        console.error("Rating error:", error);

        res.status(500).json({
            message: error.message
        });
    }
});


// Get all reviews for teacher
router.get("/:tokenId", async (req, res) => {

    try {

        const tokenId = Number(req.params.tokenId);

        if (isNaN(tokenId)) {
            return res.status(400).json({
                message: "Invalid tokenId"
            });
        }

        const reviews = await Review.find({
            tokenId
        }).sort({
            createdAt: -1
        });

        res.json(reviews);

    } catch (error) {

        console.error("Get reviews error:", error);

        res.status(500).json({
            message: error.message
        });
    }
});

export default router;