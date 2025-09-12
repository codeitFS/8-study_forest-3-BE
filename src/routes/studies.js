import express from 'express';
import * as controller from '../controllers/studiesController.js';
import { requireAuth } from '../middlewares/auth.js';

// Studies 도메인 라우트 정의

const router = express.Router();

router.post('/studies', controller.create); // 생성
router.get('/studies', controller.list); // 페이징 목록
router.get('/studiesAll', controller.listAll); // 전체 목록 (페이징 없음)
router.get('/studies/:id', controller.getById); // 단건 조회
router.patch('/studies/:id', requireAuth, controller.update); // 수정 (JWT 필요)
router.patch('/studies/:id/points', controller.incrementPoints); // 포인트 증가
router.delete('/studies/:id', requireAuth, controller.remove); // 삭제 (JWT 필요)

export default router;
