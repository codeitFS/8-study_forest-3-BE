import express from 'express';
import { prisma } from '../lib/prisma.js';
import { parseId, verifyStudyPassword, toHashedPasswordIfNeeded } from '../lib/utils.js';

const router = express.Router();

// parseId, verifyStudyPassword 는 utils.js 사용

// 응답에서 password 숨기기
function sanitizeStudy(study) {
    if (!study) return study;
    const { password, ...rest } = study;
    return rest;
}

// POST /studies
router.post('/studies', async (req, res, next) => {
    try {
        const { nickname, name, description, background, password } = req.body;

        if (!nickname || !name || !background || !password) {
            return res.status(400).json({
                error: 'nickname, name, background, password are necessary',
            });
        }

        const hashed = await toHashedPasswordIfNeeded(password);
        const study = await prisma.study.create({
            data: {
                nickname,
                name,
                description,
                background,
                password: hashed,
            },
        });

        return res.status(201).json(sanitizeStudy(study));
    } catch (err) {
        // Unique 확인
        if (err.code === 'P2002') {
            return res.status(409).json({
                error: 'Unique constraint violation',
                meta: err.meta,
            });
        }
        return next(err);
    }
});

// GET /studies
router.get('/studies', async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
        const search = (req.query.search || '').toString().trim();

        const where = search
            ? {
                  OR: [
                      { name: { contains: search, mode: 'insensitive' } },
                      { nickname: { contains: search, mode: 'insensitive' } },
                  ],
              }
            : undefined;

        const [total, items] = await Promise.all([
            prisma.study.count({ where }),
            prisma.study.findMany({
                where,
                orderBy: { id: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ]);

        res.json({
            items: items.map(sanitizeStudy),
            meta: {
                total,
                page,
                pageSize,
                totalPages: Math.max(1, Math.ceil(total / pageSize)),
            },
        });
    } catch (err) {
        next(err);
    }
});

// GET /studies/:id - 상세
router.get('/studies/:id', async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        if (!id)
            return res.status(400).json({
                error: 'Invalid id',
            });

        const study = await prisma.study.findUnique({
            where: { id },
        });
        if (!study)
            return res.status(404).json({
                error: 'Study not found',
            });

        return res.json(sanitizeStudy(study));
    } catch (err) {
        next(err);
    }
});

// PATCH /studies/:id - 수정 (비밀번호 필요)
router.patch('/studies/:id', async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        if (!id)
            return res.status(400).json({
                error: 'Invalid id',
            });

        const { password, nickname, name, description, background, newPassword } = req.body || {};
        const auth = await verifyStudyPassword(id, password);
        if (!auth.ok)
            return res.status(auth.code).json({
                error: auth.message,
            });

        const data = {};
        if (typeof nickname === 'string') data.nickname = nickname;
        if (typeof name === 'string') data.name = name;
        if (typeof description === 'string') data.description = description;
        if (typeof background === 'string') data.background = background;
        if (typeof newPassword === 'string' && newPassword.length > 0) {
            data.password = await toHashedPasswordIfNeeded(newPassword);
        }

        if (Object.keys(data).length === 0) {
            return res.status(400).json({
                error: 'No updatable fields provided',
            });
        }

        const updated = await prisma.study.update({
            where: { id },
            data,
        });
        return res.json(sanitizeStudy(updated));
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                error: 'Unique constraint violation',
                meta: err.meta,
            });
        }
        next(err);
    }
});

// PATCH /studies/:id/points - points 증가 전용(비밀번호 필요 X)
router.patch('/studies/:id/points', async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        if (!id)
            return res.status(400).json({
                error: 'Invalid id',
            });

        const { increment } = req.body || {};
        const inc = Number(increment);
        if (!Number.isInteger(inc) || inc < 0)
            return res.status(400).json({
                error: 'increment must be a positive integer',
            });
        const updated = await prisma.study.update({
            where: { id },
            data: { points: { increment: inc } },
        });
        return res.json(sanitizeStudy(updated));
    } catch (err) {
        next(err);
    }
});

// DELETE /studies/:id - 삭제 (비밀번호 필요)
router.delete('/studies/:id', async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        if (!id)
            return res.status(400).json({
                error: 'Invalid id',
            });

        const { password } = req.body || {};
        const auth = await verifyStudyPassword(id, password);
        if (!auth.ok)
            return res.status(auth.code).json({
                error: auth.message,
            });

        await prisma.study.delete({
            where: { id },
        });
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
});

export default router;
