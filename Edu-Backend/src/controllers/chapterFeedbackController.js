import ChapterFeedback from '../models/ChapterFeedback.js';
import ChapterSubmission from '../models/ChapterSubmission.js';

// Post a new review verdict & feedback comments
export const submitReview = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { verdict, generalFeedback, sectionComments, versionNumber } = req.body;
    const advisorId = req.user._id;

    if (!verdict || !generalFeedback || !versionNumber) {
      return res.status(400).json({ success: false, message: 'Verdict, general feedback, and target version number are required.' });
    }

    if (!['Approved', 'Revisions_Requested', 'Rejected'].includes(verdict)) {
      return res.status(400).json({ success: false, message: 'Invalid verdict value.' });
    }

    // 1. Resolve Submission
    const submission = await ChapterSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Chapter submission not found.' });
    }

    // 2. Add feedback record
    const feedback = new ChapterFeedback({
      submissionId: submission._id,
      versionNumber: parseInt(versionNumber),
      advisor: advisorId,
      verdict,
      generalFeedback,
      sectionComments: sectionComments || []
    });
    await feedback.save();

    // 3. Update chapter submission overall status & the specific version's status
    submission.currentStatus = verdict;
    
    // Find the version in the array and update its status
    const targetVersion = submission.versions.find(v => v.versionNumber === parseInt(versionNumber));
    if (targetVersion) {
      targetVersion.status = verdict;
    }
    
    await submission.save();

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: feedback
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Retrieve feedback list for a chapter submission
export const getSubmissionFeedback = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const feedbacks = await ChapterFeedback.find({ submissionId })
      .populate('advisor', 'fullName email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
