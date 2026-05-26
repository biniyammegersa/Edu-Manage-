export type SubmissionResponse = {
  success: boolean;
  count: number;
  data: Submission[];
};

export type Submission = {
  _id: string;
  id: string;
  title: string;
  student: Student;
  teacher: Teacher;
  status: 'Pending' | 'Approved' | 'Rejected' | string;
  attachments: Attachment[];
  feedbackList: Feedback[];
  group?: string;
  plagiarismReport?: PlagiarismReport;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type Student = {
  _id: string;
  fullName: string;
  email: string;
  department: string;
};

export type Teacher = {
  _id: string;
  fullName: string;
  email: string;
};

export type Attachment = {
  name: string;
  url: string;
  type: string;
  size: number;
  _id: string;
  id: string;
};

export type Feedback = {
  _id: string;
  teacher: string;
  projectTitle: string;
  status: 'Pending' | 'Approved' | 'Rejected' | string;
  sections: FeedbackSection[];
  attachments: FeedbackAttachment[];
  createdAt: string;
  updatedAt: string;
};

export type FeedbackSection = {
  _id: string;
  id: string;
  title: string;
  rating: number;
  strengths: string;
  areasForImprovement: string;
  comments: string;
};

export type FeedbackAttachment = {
  _id: string;
  id: string;
  fileName: string;
  size: string;
  downloadLink: string;
};

export type PlagiarismReport = {
  _id: string;
  title: string;
  overallRisk: 'Low' | 'Medium' | 'High';
  confidence: number;
  originalityScore: number;
  sectionAnalysis: {
    section: string;
    risk: 'Low' | 'Medium' | 'High';
    issues: string[];
    feedback: string[];
    _id?: string;
  }[];
  majorConcerns: string[];
  recommendations: string[];
  summary: string;
  createdAt: string;
  updatedAt: string;
};
