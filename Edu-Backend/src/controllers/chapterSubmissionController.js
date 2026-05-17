import ChapterSubmission from '../models/ChapterSubmission.js';
import Group from '../models/Group.js';
import Project from '../models/Project.js';
import { parseDocument } from '../services/documentParser.js';
import { validateTemplate } from '../services/validationEngine.js';
import { performAcademicAIAnalysis } from '../services/aiAnalysisService.js';
import { runPlagiarismCheck } from '../services/similarityService.js';
import { checkSubmissionEligibility } from '../services/sequenceService.js';

// Submit or revise a chapter
export const submitChapter = async (req, res) => {
  try {
    const { chapterNumber, chapterType, title } = req.body;
    const studentId = req.user._id;
    const file = req.file;

    if (!chapterNumber || !chapterType || !title) {
      return res.status(400).json({ success: false, message: 'Chapter number, type, and title are required.' });
    }

    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a DOCX or PDF file.' });
    }

    const parsedChapterNumber = parseInt(chapterNumber);

    // 1. Resolve Student Group
    const group = await Group.findOne({ members: studentId });
    if (!group) {
      return res.status(400).json({ success: false, message: 'Student does not belong to any group.' });
    }

    // 2. Resolve Project linked to Group
    const project = await Project.findOne({ group: group._id });
    if (!project) {
      return res.status(400).json({ success: false, message: 'No project found registered for your student group.' });
    }

    // 3. Enforce Sequencing Rules
    const eligibility = await checkSubmissionEligibility(project._id, parsedChapterNumber);
    if (!eligibility.eligible) {
      return res.status(400).json({ success: false, message: eligibility.message });
    }

    // 4. Parse Document text and structure
    const { text, html } = await parseDocument(file.buffer, file.mimetype);

    // 5. Template check
    const templateValidation = validateTemplate(text, parsedChapterNumber);

    // 6. Manage Version Control
    let submission = await ChapterSubmission.findOne({ project: project._id, chapterNumber: parsedChapterNumber });
    let versionNum = 1;

    if (submission) {
      versionNum = submission.versions.length + 1;
    }

    // File URL (In local environment, save buffer or write a temp path; S3/Cloudinary url in production)
    const fileUrl = `/uploads/documentation/${Date.now()}_${file.originalname}`;

    const newVersion = {
      versionNumber: versionNum,
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      submittedBy: studentId,
      status: 'Under_Review',
      templateValidation,
      submissionDate: new Date()
    };

    if (submission) {
      submission.versions.push(newVersion);
      submission.currentStatus = 'Under_Review';
      submission.title = title;
      await submission.save();
    } else {
      submission = new ChapterSubmission({
        project: project._id,
        group: group._id,
        chapterNumber: parsedChapterNumber,
        chapterType,
        title,
        currentStatus: 'Under_Review',
        versions: [newVersion]
      });
      await submission.save();
    }

    // 7. Fire Async AI academic review and plagiarism checks in background
    process.nextTick(async () => {
      try {
        const plagResult = await runPlagiarismCheck(text, submission._id, group.name);
        const aiReport = await performAcademicAIAnalysis(text, parsedChapterNumber, title);

        await ChapterSubmission.updateOne(
          { _id: submission._id, "versions.versionNumber": versionNum },
          { 
            $set: {
              "versions.$.plagiarismReport": {
                similarityScore: plagResult.similarityScore,
                matchedDetails: plagResult.matchedDetails,
                checkedAt: new Date()
              },
              "versions.$.aiAcademicReport": {
                ...aiReport,
                analyzedAt: new Date()
              }
            }
          }
        );
        console.log(`✅ Background analysis completed for Chapter ${parsedChapterNumber} (v${versionNum})`);
      } catch (err) {
        console.error('Background analysis failed:', err);
      }
    });

    return res.status(201).json({
      success: true,
      message: `Chapter ${parsedChapterNumber} submitted successfully as version ${versionNum}!`,
      data: submission
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Retrieve student submissions (returns complete 1-7 chapter matrix)
export const getMySubmissions = async (req, res) => {
  try {
    const studentId = req.user._id;

    const group = await Group.findOne({ members: studentId });
    if (!group) {
      return res.status(200).json({ success: true, data: [] });
    }

    const submissions = await ChapterSubmission.find({ group: group._id })
      .populate('versions.submittedBy', 'fullName email')
      .sort({ chapterNumber: 1 });

    return res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Retrieve single chapter submission by ID
export const getSubmissionDetails = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await ChapterSubmission.findById(submissionId)
      .populate('versions.submittedBy', 'fullName email')
      .populate('project', 'title')
      .populate('group', 'name members');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Chapter submission not found.' });
    }

    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Retrieve pending submissions for advisors
export const getPendingReviews = async (req, res) => {
  try {
    const advisorId = req.user._id;

    // Find all groups mentored by this advisor
    const groups = await Group.find({ mentor: advisorId });
    const groupIds = groups.map(g => g._id);

    const pending = await ChapterSubmission.find({
      group: { $in: groupIds },
      currentStatus: 'Under_Review'
    })
      .populate('group', 'name')
      .populate('project', 'title')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: pending
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
