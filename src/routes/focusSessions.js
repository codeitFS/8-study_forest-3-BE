import express from 'express';
import * as controller from '../controllers/focusSessionsController.js';
import { requireAuth } from '../middlewares/auth.js';

// Focus Session (스터디 1:1) 라우트

const router = express.Router();

router.post('/studies/:studyId/focus_session', requireAuth, controller.create); // 생성
router.get('/studies/:studyId/focus_session', controller.get); // 조회
router.patch('/studies/:studyId/focus_session', requireAuth, controller.update); // 수정
router.delete('/studies/:studyId/focus_session', requireAuth, controller.remove); // 삭제

export default router;
