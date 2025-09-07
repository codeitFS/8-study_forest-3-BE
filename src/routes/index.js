import express from 'express';
import studiesRouter from './studies.js';
import habitsRouter from './habits.js';
import focusSessionsRouter from './focusSessions.js';
import emojisRouter from './emojis.js';

const router = express.Router();

router.use('/', studiesRouter);
router.use('/', habitsRouter);
router.use('/', focusSessionsRouter);
router.use('/', emojisRouter);

export default router;
