import express from 'express';
import * as controller from '../controllers/focusSessionsController.js';

const router = express.Router();

router.post('/studies/:studyId/focus_session', controller.create);
router.get('/studies/:studyId/focus_session', controller.get);
router.patch('/studies/:studyId/focus_session', controller.update);
router.delete('/studies/:studyId/focus_session', controller.remove);

export default router;
