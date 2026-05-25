import ChapterSubmission from '../models/ChapterSubmission.js';
import Project from '../models/Project.js';

export const DOCUMENTATION_CHAPTER_COUNT = 7;

/** Placeholder project so groups can submit documentation chapters before full project submission. */
export const getOrCreateDraftProjectForGroup = async (group) => {
  let project = await Project.findOne({ group: group._id });
  if (project) return project;

  return Project.create({
    title: 'Documentation in progress',
    elevatorPitch: 'Draft — complete all chapters before final project submission.',
    group: group._id,
    reviewedByTeacherId: group.mentor,
    status: 'pending',
    teamMembers: [],
  });
};

/**
 * All thesis documentation chapters (1–7) must be Approved before full project submission.
 */
export const checkAllDocumentationChaptersApprovedForGroup = async (groupId) => {
  const submissions = await ChapterSubmission.find({ group: groupId });

  const statusByChapter = {};
  submissions.forEach((s) => {
    statusByChapter[s.chapterNumber] = s.currentStatus;
  });

  const pending = [];
  for (let chapter = 1; chapter <= DOCUMENTATION_CHAPTER_COUNT; chapter++) {
    const status = statusByChapter[chapter];
    if (status !== 'Approved') {
      if (!status) {
        pending.push(`Chapter ${chapter} (not submitted)`);
      } else {
        pending.push(`Chapter ${chapter} (${status.replace(/_/g, ' ')})`);
      }
    }
  }

  const approvedCount = DOCUMENTATION_CHAPTER_COUNT - pending.length;

  if (pending.length > 0) {
    return {
      eligible: false,
      approvedCount,
      total: DOCUMENTATION_CHAPTER_COUNT,
      pending,
      message: `All ${DOCUMENTATION_CHAPTER_COUNT} documentation chapters must be approved before you can submit your project. Still needed: ${pending.join(', ')}.`,
    };
  }

  return {
    eligible: true,
    approvedCount: DOCUMENTATION_CHAPTER_COUNT,
    total: DOCUMENTATION_CHAPTER_COUNT,
    pending: [],
    message: 'All documentation chapters are approved. You may submit your project.',
  };
};
