import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import metadataRoutes from "./routes/metadataRoutes.js";
import mintTeacherNFT from "./routes/mintRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import exchangeRoutes from "./routes/exchangeRoutes.js";
import { checkConnection } from "./services/blockchainService.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import exchangeRates from "./routes/exchangeRates.js";


await checkConnection();


dotenv.config();


const app = express();






/* ---------------- MIDDLEWARE (MUST COME FIRST) ---------------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




/* ---------------- ROUTES ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api", uploadRoutes);
app.use("/api", metadataRoutes);
app.use("/api", mintTeacherNFT);
app.use("/api/payment", paymentRoutes);
app.use("/api/exchange", exchangeRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/rental", rentalRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/exchange-rates", exchangeRates);
/* ---------------- DEBUG ---------------- */
console.log("MONGO_URI =", process.env.MONGO_URI);

/* ---------------- DB CONNECTION ---------------- */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* ---------------- SERVER ---------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

