import express from "express";

import { createPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Payment Route Working",
  });
});

router.post("/create-order", createPayment);

export default router;