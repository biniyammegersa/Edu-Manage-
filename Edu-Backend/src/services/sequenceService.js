import ChapterSubmission from '../models/ChapterSubmission.js';

export const checkSubmissionEligibility = async (projectId, chapterNumber) => {
  if (chapterNumber === 1) return { eligible: true };

  // Fetch all prior submissions
  const submissions = await ChapterSubmission.find({ project: projectId });
  const subMap = {};
  submissions.forEach(s => {
    subMap[s.chapterNumber] = s.currentStatus;
  });

  const prerequisiteChapter = chapterNumber - 1;
  const prereqStatus = subMap[prerequisiteChapter];

  if (!prereqStatus || prereqStatus !== 'Approved') {
    const statusHint = prereqStatus
      ? ` (current status: ${prereqStatus.replace(/_/g, ' ')})`
      : '';
    return {
      eligible: false,
      message: `Chapter ${prerequisiteChapter} must be officially Approved before you can submit Chapter ${chapterNumber}${statusHint}.`,
    };
  }

  return { eligible: true };
};
