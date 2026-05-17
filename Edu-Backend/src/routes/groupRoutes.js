import express from 'express';
import { createGroup, getMyGroup, getAllGroups, assignMentor } from '../controllers/groupController.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.post('/', createGroup);
router.post('/assign-mentor', assignMentor);
router.get('/my-group', getMyGroup);
router.get('/all', getAllGroups);

export default router;
