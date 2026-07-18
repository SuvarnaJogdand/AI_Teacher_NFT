import express from "express";

import {
    createTeacher,
    getTeacher,
    getAllTeachers,
    totalTeachers,
    addSkill,
    getSkills
} from "../controllers/teacherController.js";

const router = express.Router();

// -----------------------------------------
// Mint Teacher NFT
// POST /api/teachers
// -----------------------------------------

router.post("/", createTeacher);

// -----------------------------------------
// Get Total Teachers
// GET /api/teachers/total
// -----------------------------------------

router.get("/total", totalTeachers);

// -----------------------------------------
// Get All Teachers
// GET /api/teachers
// -----------------------------------------

router.get("/", getAllTeachers);

// -----------------------------------------
// Add Skill
// POST /api/teachers/skills
// -----------------------------------------

router.post("/skills", addSkill);

// -----------------------------------------
// Get Skills
// GET /api/teachers/:tokenId/skills
// -----------------------------------------

router.get("/:tokenId/skills", getSkills);

// -----------------------------------------
// Get Teacher By Token ID
// GET /api/teachers/:tokenId
// -----------------------------------------

router.get("/:tokenId", getTeacher);

export default router;