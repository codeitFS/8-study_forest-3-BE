import express from 'express';
import * as controller from '../controllers/focusSessionsController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/studies/:studyId/focus_session', requireAuth, controller.create);
router.get('/studies/:studyId/focus_session', controller.get);
router.patch('/studies/:studyId/focus_session', requireAuth, controller.update);
router.delete('/studies/:studyId/focus_session', requireAuth, controller.remove);

export default router;
