import express from 'express';
import { issueAccessToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/auth', issueAccessToken);

export default router;
