import express from 'express';
import { prisma } from '../repositories/prismaClient.js';
import { parseId } from '../utils/index.js';

const router = express.Router();

// GET /emojis - 목록 조회
router.get('/emojis', async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
        const search = (req.query.search || '').toString().trim();

        const where = search
            ? {
                  emoji: {
                      contains: search,
                  },
              }
            : undefined;

        const [total, items] = await Promise.all([
            prisma.emoji.count({ where }),
            prisma.emoji.findMany({
                where,
                orderBy: { id: 'asc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ]);

        return res.json({
            items,
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

// GET /emojis/:id - 상세 조회
router.get('/emojis/:id', async (req, res, next) => {
    try {
        const id = (req.params.id || '').trim();
        if (!id)
            return res.status(400).json({
                error: 'Invalid id',
            });
        const item = await prisma.emoji.findUnique({
            where: { id },
        });
        if (!item)
            return res.status(404).json({
                error: 'Emoji not found',
            });
        return res.json(item);
    } catch (err) {
        next(err);
    }
});

// DELETE /emojis/:id - 삭제
// 외부 api에서 이모티콘을 받아오기 때문에 삭제가 필요없다고 판단
// router.delete('/emojis/:id', async (req, res, next) => {
//     try {
//         const id = parseId(req.params.id);
//         if (!id)
//             return res.status(400).json({
//                 error: 'Invalid id',
//             });
//         await prisma.emoji.delete({
//             where: { id },
//         });
//         return res.status(204).send();
//     } catch (err) {
//         next(err);
//     }
// });

// POST /studies/:studyId
// study-emoji 연결/count++ (이모티콘을 눌렀을 때 +1)
router.post('/studies/:studyId', async (req, res, next) => {
    try {
        const studyId = parseId(req.params.studyId);
        const emojiId = (req.body?.unified || '').trim();
        if (!studyId || !emojiId) {
            return res.status(400).json({
                error: 'Invalid studyId or emojiId',
            });
        }

        // study/emoji 존재 확인
        const studyExists = await prisma.study.findUnique({
            where: { id: studyId },
            select: { id: true },
        });
        if (!studyExists) {
            return res.status(404).json({ error: 'Study not found' });
        }

        const emojiExists = await prisma.emoji.findUnique({
            where: { id: emojiId },
            select: { id: true, emoji: true },
        });
        if (!emojiExists)
            return res.status(404).json({
                error: 'Emoji not found',
            });

        // unique 키(studyId, emojiId)로 레코드가 없으면 생성(count = 1)
        // 있으면 count += 1
        const updated = await prisma.studyEmoji.upsert({
            where: { studyId_emojiId: { studyId, emojiId } },
            update: { count: { increment: 1 } },
            create: { studyId, emojiId, count: 1 },
        });

        return res.status(200).json({
            studyId: updated.studyId,
            emojiId: updated.emojiId,
            emoji: emojiExists.emoji,
            count: updated.count,
        });
    } catch (err) {
        if (err?.code === 'P2003') {
            return res.status(404).json({ error: 'Study or Emoji not found' });
        }
        next(err);
    }
});

// GET /studies/:studyId/emojis - 스터디의 이모지 카운트 전체 목록 조회
router.get('/studies/:studyId/emojis', async (req, res, next) => {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId)
            return res.status(400).json({
                error: 'Invalid studyId',
            });

        const studyExists = await prisma.study.findUnique({
            where: { id: studyId },
            select: { id: true },
        });
        if (!studyExists)
            return res.status(404).json({
                error: 'Study not found',
            });

        const rows = await prisma.studyEmoji.findMany({
            where: { studyId },
            include: { emoji: true },
            orderBy: [{ count: 'desc' }, { emojiId: 'asc' }],
        });

        const items = rows.map((r) => ({
            emojiId: r.emojiId,
            emoji: r.emoji?.emoji ?? '',
            count: r.count,
        }));
        return res.json({ items });
    } catch (err) {
        next(err);
    }
});

export default router;
