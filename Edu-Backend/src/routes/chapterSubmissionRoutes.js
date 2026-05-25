import express from 'express';
import { 
  submitChapter, 
  getMySubmissions, 
  getSubmissionDetails, 
  getPendingReviews,
  getMentorDocumentationHistory,
  getDocumentationReadiness,
} from '../controllers/chapterSubmissionController.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { docxUpload } from '../middleware/docxUpload.js';
import checkRole from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/submit', protectRoute, checkRole(['student']), docxUpload.single('file'), submitChapter);
router.get('/readiness', protectRoute, checkRole(['student']), getDocumentationReadiness);
router.get('/my-submissions', protectRoute, checkRole(['student']), getMySubmissions);
router.get('/details/:submissionId', protectRoute, getSubmissionDetails);
router.get('/pending', protectRoute, checkRole(['teacher']), getPendingReviews);
router.get('/mentor/history', protectRoute, checkRole(['teacher']), getMentorDocumentationHistory);

export default router;
