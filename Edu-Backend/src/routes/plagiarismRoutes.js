import express from "express";
import { checkPlagiarism } from "../controllers/plagiarismController.js";

const router = express.Router();

/**
 * @route   POST /api/plagiarism/check
 * @desc    Analyze a proposal for plagiarism
 * @access  Public (or add auth middleware if required)
 */
router.post("/check", checkPlagiarism);

export default router;
