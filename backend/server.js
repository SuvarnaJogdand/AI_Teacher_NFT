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