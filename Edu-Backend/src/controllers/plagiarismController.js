import { analyzeProposal, analyzeDocumentation } from "../services/plagiarismService.js";
import PlagiarismReport from "../models/PlagiarismReport.js";
import DocumentationIntegrityReport from "../models/DocumentationIntegrityReport.js";

/**
 * Handles requests to analyze a proposal for plagiarism.
 * POST /api/plagiarism/check
 */
export const checkPlagiarism = async (req, res) => {
  try {
    const { title, proposalData } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required for analysis." });
    }

    if (!proposalData || typeof proposalData !== "object" || Object.keys(proposalData).length === 0) {
      return res.status(400).json({ error: "Valid proposalData object is required." });
    }

    const analysisResult = await analyzeProposal(title, proposalData);

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

    res.status(200).json({ success: true, data: newReport });
  } catch (error) {
    console.error("Error in checkPlagiarism controller:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred during plagiarism analysis.",
    });
  }
};

/**
 * Handles requests to analyze a chapter/documentation submission for integrity.
 * POST /api/plagiarism/check-documentation
 */
export const checkDocumentationIntegrity = async (req, res) => {
  try {
    const { submissionId, chapterNumber, chapterType, title, documentText } = req.body;

    if (!chapterNumber || !chapterType || !title) {
      return res.status(400).json({
        success: false,
        error: "chapterNumber, chapterType, and title are required.",
      });
    }

    if (!documentText || typeof documentText !== "string" || documentText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: "documentText must be a non-empty string of at least 50 characters.",
      });
    }

    console.log(`📄 Starting documentation integrity analysis for Chapter ${chapterNumber}: "${title}"`);

    const analysisResult = await analyzeDocumentation(
      chapterNumber,
      chapterType,
      title,
      documentText
    );

    const newReport = new DocumentationIntegrityReport({
      submissionId: submissionId || null,
      chapterNumber,
      chapterType,
      title,
      overallRisk: analysisResult.overallRisk,
      confidence: analysisResult.confidence,
      originalityScore: analysisResult.originalityScore,
      chapterIntegrityScore: analysisResult.chapterIntegrityScore,
      contentType: analysisResult.contentType,
      chapterAnalysis: analysisResult.chapterAnalysis,
      majorConcerns: analysisResult.majorConcerns || [],
      recommendations: analysisResult.recommendations || [],
      summary: analysisResult.summary || "No summary provided.",
    });

    await newReport.save();

    console.log(`✅ Documentation integrity report saved for Chapter ${chapterNumber}: "${title}"`);

    res.status(200).json({ success: true, data: newReport });
  } catch (error) {
    console.error("Error in checkDocumentationIntegrity controller:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred during documentation integrity analysis.",
    });
  }
};
