export const DOCUMENTATION_CHAPTER_COUNT = 7;

export function getDocumentationProgressFromSubmissions(submissions: any[]) {
  const subMap: Record<number, any> = {};
  submissions.forEach((s) => {
    subMap[s.chapterNumber] = s;
  });

  const pending: string[] = [];
  for (let chapter = 1; chapter <= DOCUMENTATION_CHAPTER_COUNT; chapter++) {
    const sub = subMap[chapter];
    if (!sub) {
      pending.push(`Chapter ${chapter} (not submitted)`);
    } else if (sub.currentStatus !== "Approved") {
      pending.push(
        `Chapter ${chapter} (${String(sub.currentStatus).replace(/_/g, " ")})`
      );
    }
  }

  const approvedCount = DOCUMENTATION_CHAPTER_COUNT - pending.length;
  return {
    eligible: pending.length === 0,
    approvedCount,
    total: DOCUMENTATION_CHAPTER_COUNT,
    pending,
  };
}
