import mongoose from "mongoose";

const chapterAspectSchema = new mongoose.Schema({
  aspect: {
    type: String,
    required: true,
  },
  risk: {
    type: String,
    enum: ["Low", "Medium", "High"],
    required: true,
  },
  issues: [{ type: String }],
  feedback: [{ type: String }],
});

const documentationIntegrityReportSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChapterSubmission",
      default: null,
    },
    chapterNumber: {
      type: Number,
      required: true,
    },
    chapterType: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    overallRisk: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
    },
    originalityScore: {
      type: Number,
      required: true,
    },
    chapterIntegrityScore: {
      type: Number,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["Technical", "Mixed", "Generic"],
      required: true,
    },
    chapterAnalysis: [chapterAspectSchema],
    majorConcerns: [{ type: String }],
    recommendations: [{ type: String }],
    summary: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const DocumentationIntegrityReport = mongoose.model(
  "DocumentationIntegrityReport",
  documentationIntegrityReportSchema
);

export default DocumentationIntegrityReport;
