import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

function parseId(param) {
    const id = Number(param);
    return Number.isInteger(id) && id > 0 ? id : null;
}

async function verifyStudyPassword(studyId, password) {
    if (!password)
        return {
            ok: false,
            code: 400,
            message: 'password is required',
        };
    const study = await prisma.study.findUnique({
        where: {
            id: studyId,
        },
        select: {
            id: true,
            password: true,
        },
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

// POST /studies/:studyId/focus_session - 생성 (1:1, 존재하면 409)
router.post('/studies/:studyId/focus_session', async (req, res, next) => {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId)
            return res.status(400).json({
                error: 'Invalid studyId',
            });

        const { password, duration } = req.body || {};
        const auth = await verifyStudyPassword(studyId, password);
        if (!auth.ok)
            return res.status(auth.code).json({
                error: auth.message,
            });

        const data = {
            studyId,
        };
        if (duration !== undefined) {
            const d = Number(duration);
            if (!Number.isInteger(d) || d < 0)
                return res.status(400).json({
                    error: 'duration must be a non-negative integer',
                });
            data.duration = d;
        }

        const created = await prisma.focusSession.create({ data });
        return res.status(201).json(created);
    } catch (err) {
        if (err.code === 'P2002') {
            // unique constraint on studyId
            return res.status(409).json({
                error: 'FocusSession already exists for this study',
            });
        }
        next(err);
    }
});

// GET /studies/:studyId/focus_session - 단건 조회(없으면 404)
router.get('/studies/:studyId/focus_session', async (req, res, next) => {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId)
            return res.status(400).json({
                error: 'Invalid studyId',
            });
        const fs = await prisma.focusSession.findUnique({
            where: { studyId },
        });
        if (!fs)
            return res.status(404).json({
                error: 'FocusSession not found',
            });
        return res.json(fs);
    } catch (err) {
        next(err);
    }
});

// PATCH /studies/:studyId/focus_session - 수정 (password 필요, duration 직접 설정)
router.patch('/studies/:studyId/focus_session', async (req, res, next) => {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId)
            return res.status(400).json({
                error: 'Invalid studyId',
            });

        const { password, duration } = req.body || {};
        const auth = await verifyStudyPassword(studyId, password);
        if (!auth.ok)
            return res.status(auth.code).json({
                error: auth.message,
            });

        const existing = await prisma.focusSession.findUnique({
            where: { studyId },
        });
        if (!existing)
            return res.status(404).json({
                error: 'FocusSession not found',
            });

        if (duration === undefined) {
            return res.status(400).json({ error: 'duration is required' });
        }
        const d = Number(duration);
        if (!Number.isInteger(d) || d < 0) {
            return res.status(400).json({ error: 'duration must be a non-negative integer' });
        }

        const updated = await prisma.focusSession.update({
            where: { studyId },
            data: { duration: d },
        });
        return res.json(updated);
    } catch (err) {
        next(err);
    }
});

// DELETE /studies/:studyId/focus_session - 삭제 (password 필요)
router.delete('/studies/:studyId/focus_session', async (req, res, next) => {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId)
            return res.status(400).json({
                error: 'Invalid studyId',
            });
        const { password } = req.body || {};
        const auth = await verifyStudyPassword(studyId, password);
        if (!auth.ok)
            return res.status(auth.code).json({
                error: auth.message,
            });

        const existing = await prisma.focusSession.findUnique({ where: { studyId } });
        if (!existing)
            return res.status(404).json({
                error: 'FocusSession not found',
            });

        await prisma.focusSession.delete({ where: { studyId } });
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
});

export default router;
