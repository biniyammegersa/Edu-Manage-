import express from 'express';
import { 
  submitReview, 
  getSubmissionFeedback 
} from '../controllers/chapterFeedbackController.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import checkRole from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/review/:submissionId', protectRoute, checkRole(['teacher']), submitReview);
router.get('/submission/:submissionId', protectRoute, getSubmissionFeedback);

export default router;
