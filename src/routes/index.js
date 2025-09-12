import express from 'express';
import studiesRouter from './studies.js';
import habitsRouter from './habits.js';
import focusSessionsRouter from './focusSessions.js';
import emojisRouter from './emojis.js';
import authRouter from './auth.js';

// 각 도메인별 하위 라우터를 하나의 루트 라우터로 결합

const router = express.Router();

router.use('/', studiesRouter); // /studies ...
router.use('/', habitsRouter); // /studies/:studyId/habits ...
router.use('/', focusSessionsRouter); // /studies/:studyId/focus_session ...
router.use('/', emojisRouter); // /emojis, /studies/:studyId/emojis ...
router.use('/', authRouter); // /auth

export default router;
