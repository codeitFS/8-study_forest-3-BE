import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

function parseId(param) {
    const id = Number(param);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function isValidWeeklyClear(value) {
    if (typeof value !== 'string') return false;
    // format: 0|0|0|0|0|0|0 (7 digits 0/1 -> 0: false, 1: true)
    return /^(0|1)(\|(0|1)){6}$/.test(value);
}

async function verifyStudyPassword(studyId, password) {
    if (!password)
        return {
            ok: false,
            code: 400,
            message: 'password is required',
        };
    const study = await prisma.study.findUnique({
        where: { id: studyId },
        select: { id: true, password: true },
    });
    if (!study)
        return {
            ok: false,
            code: 404,
            message: 'Study not found',
        };
    if (study.password !== password)
        return {
            ok: false,
            code: 403,
            message: 'Invalid password',
        };
    return {
        ok: true,
    };
}

// POST /studies/:studyId/habits - 습관 생성 (스터디 비밀번호 필요)
router.post('/studies/:studyId/habits', async (req, res, next) => {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId)
            return res.status(400).json({
                error: 'Invalid studyId',
            });

        const { name, weeklyClear, password } = req.body || {};
        if (!name)
            return res.status(400).json({
                error: 'name is required',
            });
        if (weeklyClear !== undefined && !isValidWeeklyClear(weeklyClear)) {
            return res.status(400).json({
                error: 'weeklyClear must be like 0|0|0|0|0|0|0',
            });
        }

        const auth = await verifyStudyPassword(studyId, password);
        if (!auth.ok)
            return res.status(auth.code).json({
                error: auth.message,
            });

        const habit = await prisma.habit.create({
            data: {
                studyId,
                name,
                ...(weeklyClear
                    ? {
                          weeklyClear,
                      }
                    : {}),
            },
        });
        return res.status(201).json(habit);
    } catch (err) {
        next(err);
    }
});

// GET /studies/:studyId/habits - 특정 스터디의 습관 목록
router.get('/studies/:studyId/habits', async (req, res, next) => {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId)
            return res.status(400).json({
                error: 'Invalid studyId',
            });

        const page = Math.max(1, Number(req.query.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
        const search = (req.query.search || '').toString().trim();

        const where = {
            studyId,
            ...(search
                ? {
                      name: { contains: search, mode: 'insensitive' },
                  }
                : {}),
        };

        const items = await prisma.habit.findMany({
            where,
            orderBy: { id: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        res.json(items);
    } catch (err) {
        next(err);
    }
});

// GET /studies/:studyId/habits/:id - 습관 상세 조회
router.get('/studies/:studyId/habits/:id', async (req, res, next) => {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId)
            return res.status(400).json({
                error: 'Invalid studyId',
            });
        const id = parseId(req.params.id);
        if (!id)
            return res.status(400).json({
                error: 'Invalid id',
            });

        const habit = await prisma.habit.findUnique({
            where: { id },
        });
        if (!habit)
            return res.status(404).json({
                error: 'Habit not found',
            });
        if (habit.studyId !== studyId)
            return res.status(404).json({
                error: 'Habit not found',
            });
        return res.json(habit);
    } catch (err) {
        next(err);
    }
});

// PATCH /studies/:studyId/habits/:id - 습관 수정 (스터디 비밀번호 필요)
router.patch('/studies/:studyId/habits/:id', async (req, res, next) => {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId) return res.status(400).json({ error: 'Invalid studyId' });
        const id = parseId(req.params.id);
        if (!id)
            return res.status(400).json({
                error: 'Invalid id',
            });

        const { password, name, weeklyClear } = req.body || {};
        const existing = await prisma.habit.findUnique({
            where: { id },
        });
        if (!existing)
            return res.status(404).json({
                error: 'Habit not found',
            });
        if (existing.studyId !== studyId)
            return res.status(404).json({
                error: 'Habit not found',
            });

        const auth = await verifyStudyPassword(studyId, password);
        if (!auth.ok)
            return res.status(auth.code).json({
                error: auth.message,
            });

        const data = {};
        if (typeof name === 'string') data.name = name;
        if (weeklyClear !== undefined) {
            if (!isValidWeeklyClear(weeklyClear))
                return res.status(400).json({
                    error: 'weeklyClear must be like 0|0|0|0|0|0|0',
                });
            data.weeklyClear = weeklyClear;
        }

        if (Object.keys(data).length === 0)
            return res.status(400).json({
                error: 'No updatable fields provided',
            });

        const updated = await prisma.habit.update({ where: { id }, data });
        return res.json(updated);
    } catch (err) {
        next(err);
    }
});

// DELETE /studies/:studyId/habits/:id - 습관 삭제 (스터디 비밀번호 필요)
router.delete('/studies/:studyId/habits/:id', async (req, res, next) => {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId)
            return res.status(400).json({
                error: 'Invalid studyId',
            });
        const id = parseId(req.params.id);
        if (!id)
            return res.status(400).json({
                error: 'Invalid id',
            });

        const { password } = req.body || {};
        const existing = await prisma.habit.findUnique({
            where: { id },
        });
        if (!existing)
            return res.status(404).json({
                error: 'Habit not found',
            });
        if (existing.studyId !== studyId)
            return res.status(404).json({
                error: 'Habit not found',
            });

        const auth = await verifyStudyPassword(studyId, password);
        if (!auth.ok)
            return res.status(auth.code).json({
                error: auth.message,
            });

        await prisma.habit.delete({
            where: { id },
        });
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
});

export default router;
