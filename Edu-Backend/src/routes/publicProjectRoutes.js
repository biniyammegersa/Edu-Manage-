import express from 'express';
import { getProjects } from '../controllers/projectController.js';

const router = express.Router();

// Public feed — no authentication required
router.get('/', getProjects);

export default router;
