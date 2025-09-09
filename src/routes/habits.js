import express from 'express';
import * as controller from '../controllers/habitsController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/studies/:studyId/habits', requireAuth, controller.create);
router.get('/studies/:studyId/habits', controller.list);
router.get('/studies/:studyId/habits/:id', controller.getById);
router.patch('/studies/:studyId/habits/:id', requireAuth, controller.update);
router.delete('/studies/:studyId/habits/:id', requireAuth, controller.remove);

export default router;
