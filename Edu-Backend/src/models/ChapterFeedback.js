import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  sectionName: { type: String, required: true }, // e.g., "Problem Statement"
  commentText: { type: String, required: true },
  severity: {
    type: String,
    enum: ['Minor', 'Major', 'Critical'],
    default: 'Minor'
  }
});

const chapterFeedbackSchema = new mongoose.Schema({
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChapterSubmission', required: true },
  versionNumber: { type: Number, required: true },
  advisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verdict: {
    type: String,
    enum: ['Approved', 'Revisions_Requested', 'Rejected'],
    required: true
  },
  generalFeedback: { type: String, required: true },
  sectionComments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ChapterFeedback', chapterFeedbackSchema);
