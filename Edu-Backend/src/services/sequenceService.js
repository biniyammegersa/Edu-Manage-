import ChapterSubmission from '../models/ChapterSubmission.js';

export const checkSubmissionEligibility = async (projectId, chapterNumber) => {
  if (chapterNumber === 1) return { eligible: true };

  // Fetch all prior submissions
  const submissions = await ChapterSubmission.find({ project: projectId });
  const subMap = {};
  submissions.forEach(s => {
    subMap[s.chapterNumber] = s.currentStatus;
  });

  if (chapterNumber === 2 || chapterNumber === 3) {
    // Needs Chapter 1 submitted or approved
    const ch1Status = subMap[1];
    if (!ch1Status) {
      return { 
        eligible: false, 
        message: "You must submit Chapter 1 (Introduction) before starting Chapter 2 or 3." 
      };
    }
  }

  if (chapterNumber >= 4) {
    // Chapter N requires Chapter N-1 to be Approved
    const prerequisiteChapter = chapterNumber === 4 ? 3 : chapterNumber - 1; // Chapter 4 depends on Chapter 3
    const prereqStatus = subMap[prerequisiteChapter];

    if (!prereqStatus || prereqStatus !== 'Approved') {
      return {
        eligible: false,
        message: `Prerequisite Incomplete: Chapter ${prerequisiteChapter} must be officially 'Approved' before you can submit Chapter ${chapterNumber}.`
      };
    }
  }

  return { eligible: true };
};
