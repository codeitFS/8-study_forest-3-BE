import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// POST /studies
router.post('/', async (req, res, next) => {
    try {
        const { nickname, name, description, background, password } = req.body;

        if (!nickname || !name || !background || !password) {
            return res
                .status(400)
                .json({ error: 'nickname, name, background, password are required' });
        }

        const study = await prisma.study.create({
            data: { nickname, name, description, background, password },
        });

        return res.status(201).json(study);
    } catch (err) {
        // Unique 확인
        if (err.code === 'P2002') {
            return res.status(409).json({ error: 'Unique constraint violation', meta: err.meta });
        }
        return next(err);
    }
});

// GET /studies
router.get('/', async (_req, res) => {
    const list = await prisma.study.findMany({ orderBy: { id: 'desc' } });
    res.json(list);
});

export default router;
