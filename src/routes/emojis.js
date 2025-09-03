import express from 'express';
import { prisma } from '../lib/prisma.js';
import { parseId } from '../lib/utils.js';

const router = express.Router();

// POST /emojis - 외부 API(https://www.emoji.family/api/emojis)에서 가져와 동기화
router.post('/emojis', async (_req, res, next) => {
    try {
        const endpoint = 'https://www.emoji.family/api/emojis';

        const resp = await fetch(endpoint, { method: 'GET' });
        if (!resp.ok) {
            return res.status(502).json({ error: `Upstream error: ${resp.status}` });
        }
        const data = await resp.json();

        // emoji family의 포맷을 입력받아서 DB엔 emoji 문자열(이모티콘)만 저장
        let list = [];
        if (Array.isArray(data)) {
            if (data.length > 0 && typeof data[0] === 'string') {
                list = data;
            } else if (data.length > 0 && typeof data[0] === 'object') {
                list = data
                    .map((d) => (d && typeof d.emoji === 'string' ? d.emoji : null))
                    .filter((v) => typeof v === 'string' && v.trim().length > 0);
            }
        }

        // 정제 및 중복 제거
        list = list.map((e) => e.trim()).filter((e) => e.length > 0);
        const unique = Array.from(new Set(list));

        if (unique.length === 0) {
            return res.status(200).json({ inserted: 0, totalFetched: 0, skipped: 0, items: [] });
        }

        // 이미 존재하는 이모지 조회 (중복 삽입 방지)
        const existing = await prisma.emoji.findMany({
            where: { emoji: { in: unique } },
            select: { emoji: true },
        });
        const existingSet = new Set(existing.map((e) => e.emoji));
        const toInsert = unique.filter((e) => !existingSet.has(e));

        let inserted = 0;
        if (toInsert.length > 0) {
            // createMany 사용 (주의: unique 제약이 없으므로 사전 필터로 방지)
            const result = await prisma.emoji.createMany({
                data: toInsert.map((e) => ({ emoji: e })),
            });
            inserted = result.count || 0;
        }

        return res.status(201).json({
            inserted,
            totalFetched: unique.length,
            skipped: unique.length - inserted,
        });
    } catch (err) {
        next(err);
    }
});

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
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid id' });
        const item = await prisma.emoji.findUnique({ where: { id } });
        if (!item) return res.status(404).json({ error: 'Emoji not found' });
        return res.json(item);
    } catch (err) {
        next(err);
    }
});

// DELETE /emojis/:id - 삭제
router.delete('/emojis/:id', async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        if (!id)
            return res.status(400).json({
                error: 'Invalid id',
            });
        await prisma.emoji.delete({
            where: { id },
        });
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
});

export default router;
