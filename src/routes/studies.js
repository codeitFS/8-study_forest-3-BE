import express from 'express';
import * as controller from '../controllers/studiesController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/studies', controller.create);
router.get('/studies', controller.list); // 스터디 리스트 페이지네이션 및 메타 데이터 함께 제공
router.get('/studiesAll', controller.listAll); // 전체 스터디 리스트
router.get('/studies/:id', controller.getById);
router.patch('/studies/:id', requireAuth, controller.update);
router.patch('/studies/:id/points', controller.incrementPoints);
router.delete('/studies/:id', requireAuth, controller.remove);

export default router;
