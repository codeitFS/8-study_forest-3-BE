import express from 'express';
import * as controller from '../controllers/habitsController.js';
import { requireAuth } from '../middlewares/auth.js';

// Habits 도메인 라우트 (스터디 하위 리소스)

const router = express.Router();

router.post('/studies/:studyId/habits', requireAuth, controller.create); // 생성
router.get('/studies/:studyId/habits', controller.list); // 목록
router.get('/studies/:studyId/habits/:id', controller.getById); // 단건
router.patch('/studies/:studyId/habits/:id', requireAuth, controller.update); // 수정
router.delete('/studies/:studyId/habits/:id', requireAuth, controller.remove); // 삭제

export default router;
