import express from "express";
import multer from "multer";

import {
  uploadImage,
} from "../controllers/uploadController.js";

const router = express.Router();

// Store temp files locally
// const upload = multer({
//   dest: "uploads/",
// });

const upload = multer({
  dest: "uploads/",

  fileFilter: (req, file, cb) => {

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed"));
    }
  },
});
// Route
router.post(
  "/upload",
  upload.single("image"),
  uploadImage
);

export default router;