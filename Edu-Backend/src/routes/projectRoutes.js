import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  incrementViews,
  addLike,
  addComment,
  deleteComment,
  uploadProjectFiles,
  updateProjectStatus,
  getAdminProjects,
  getApprovedProjects,
  getMentorProjects,
  publishProject,
} from '../controllers/projectController.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);
// Project routes
router.get('/', getProjects);
// Admin routes — must be registered before /:id
router.get('/admin/all', getAdminProjects);
router.get('/admin/approved', getApprovedProjects);
router.get('/mentor/my-projects', getMentorProjects);
router.put('/:id/publish', publishProject);
router.get('/:id', getProject);
router.post('/create', uploadProjectFiles, createProject);

// Route to update project status
router.put('/:id/status', updateProjectStatus);

// Additional functionality routes
router.post('/:id/view', incrementViews);
router.post('/:id/like', addLike);
router.post('/:id/comment', addComment);
router.delete('/:id/comment/:commentId', deleteComment);

export default router;