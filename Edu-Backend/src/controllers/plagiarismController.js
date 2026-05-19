import { analyzeProposal } from "../services/plagiarismService.js";
import PlagiarismReport from "../models/PlagiarismReport.js";

/**
 * Handles requests to analyze a proposal for plagiarism.
 */
export const checkPlagiarism = async (req, res) => {
  try {
    const { title, proposalData } = req.body;

    // Validate request body
    if (!title) {
      return res.status(400).json({ error: "Title is required for analysis." });
    }

    if (!proposalData || typeof proposalData !== "object" || Object.keys(proposalData).length === 0) {
      return res.status(400).json({ error: "Valid proposalData object is required." });
    }

    // Call the AI service to analyze the proposal
    const analysisResult = await analyzeProposal(title, proposalData);

    // Save the report to the database
    const newReport = new PlagiarismReport({
      title,
      proposalData,
      overallRisk: analysisResult.overallRisk,
      confidence: analysisResult.confidence,
      originalityScore: analysisResult.originalityScore,
      sectionAnalysis: analysisResult.sectionAnalysis,
      majorConcerns: analysisResult.majorConcerns || [],
      recommendations: analysisResult.recommendations || [],
      summary: analysisResult.summary || "No summary provided.",
    });

    await newReport.save();

    // Return the result to the client
    res.status(200).json({
      success: true,
      data: newReport,
    });
  } catch (error) {
    console.error("Error in checkPlagiarism controller:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred during plagiarism analysis.",
    });
  }
};
