import express from "express";
import { checkPlagiarism, checkDocumentationIntegrity } from "../controllers/plagiarismController.js";

const router = express.Router();

/**
 * @route   POST /api/plagiarism/check
 * @desc    Analyze a project proposal for plagiarism and originality
 * @access  Public (add auth middleware if required)
 */
router.post("/check", checkPlagiarism);

/**
 * @route   POST /api/plagiarism/check-documentation
 * @desc    Analyze a chapter/documentation submission for technical integrity and originality
 * @body    { submissionId?, chapterNumber, chapterType, title, documentText }
 * @access  Public (add auth middleware if required)
 */
router.post("/check-documentation", checkDocumentationIntegrity);

export default router;
