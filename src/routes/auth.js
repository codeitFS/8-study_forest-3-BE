import express from 'express';
import { issueAccessToken } from '../controllers/authController.js';

// 인증 (토큰 발급) 라우트

const router = express.Router();

router.post('/auth', issueAccessToken); // studyId + password -> JWT 반환

export default router;
