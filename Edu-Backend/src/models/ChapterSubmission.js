import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  fileUrl: { type: String, required: true },      // Path or S3 URL
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },     // In bytes
  mimeType: { type: String, required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['Draft', 'Under_Review', 'Approved', 'Revisions_Requested', 'Rejected'],
    default: 'Under_Review'
  },
  submissionDate: { type: Date, default: Date.now },
  
  // Template Validation results
  templateValidation: {
    passed: { type: Boolean, default: false },
    presentSections: [{ type: String }],
    missingSections: [{ type: String }],
    warnings: [{ type: String }]
  },

  // AI-Powered Academic Evaluation
  aiAcademicReport: {
    completenessScore: { type: Number }, // 0 to 100
    writingQuality: { type: String },    // Good, Satisfactory, Needs Improvement
    strengths: [{ type: String }],
    weakExplanations: [{ type: String }],
    missingCriteria: [{ type: String }],
    recommendations: [{ type: String }],
    analyzedAt: { type: Date }
  },

  // Plagiarism report
  plagiarismReport: {
    similarityScore: { type: Number, default: 0 }, // 0 to 100 %
    matchedDetails: [{
      matchedDocId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChapterSubmission' },
      matchedDocTitle: { type: String },
      matchedGroup: { type: String },
      similarityPercentage: { type: Number },
      overlappingSections: [{ type: String }]
    }],
    checkedAt: { type: Date }
  }
});

const chapterSubmissionSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  chapterNumber: { type: Number, required: true, min: 1, max: 7 },
  chapterType: {
    type: String,
    required: true,
    enum: [
      'Introduction', 
      'Existing System and Literature Review', 
      'Proposed System', 
      'System Design', 
      'Implementation', 
      'System Testing', 
      'Conclusion and Recommendation'
    ]
  },
  title: { type: String, required: true },
  currentStatus: {
    type: String,
    enum: ['Draft', 'Under_Review', 'Approved', 'Revisions_Requested', 'Rejected'],
    default: 'Under_Review'
  },
  versions: [versionSchema],
  deadline: { type: Date },
  isLocked: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Composite index to prevent duplicate submissions per project and chapter
chapterSubmissionSchema.index({ project: 1, chapterNumber: 1 }, { unique: true });

export default mongoose.model('ChapterSubmission', chapterSubmissionSchema);
