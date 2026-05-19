import mongoose from "mongoose";

const sectionAnalysisSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
  },
  risk: {
    type: String,
    enum: ["Low", "Medium", "High"],
    required: true,
  },
  issues: [
    {
      type: String,
    },
  ],
  feedback: [
    {
      type: String,
    },
  ],
});

const plagiarismReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    proposalData: {
      type: mongoose.Schema.Types.Mixed,
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
    sectionAnalysis: [sectionAnalysisSchema],
    majorConcerns: [
      {
        type: String,
      },
    ],
    recommendations: [
      {
        type: String,
      },
    ],
    summary: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const PlagiarismReport = mongoose.model(
  "PlagiarismReport",
  plagiarismReportSchema
);

export default PlagiarismReport;
