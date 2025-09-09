import * as studiesService from '../services/studiesService.js';
import { parseId } from '../utils/index.js';

function sanitizeStudy(study) {
    if (!study) return study;
    const { password, ...rest } = study;
    return rest;
}

export async function create(req, res, next) {
    try {
        const { nickname, name, description, background, password } = req.body;
        if (!nickname || !name || !background || !password) {
            return res.status(400).json({
                error: 'nickname, name, background, password are necessary',
            });
        }
        const study = await studiesService.createStudy({
            nickname,
            name,
            description,
            background,
            password,
        });
        return res.status(201).json(sanitizeStudy(study));
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                error: 'Unique constraint violation',
                meta: err.meta,
            });
        }
        return next(err);
    }
}

export async function list(req, res, next) {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
        const search = (req.query.search || '').toString().trim();
        const { total, items } = await studiesService.listStudies({ page, pageSize, search });
        res.json({
            items: items.map(sanitizeStudy),
            meta: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
        });
    } catch (err) {
        next(err);
    }
}

export async function getById(req, res, next) {
    try {
        const id = parseId(req.params.id);
        if (!id)
            return res.status(400).json({
                error: 'Invalid id',
            });
        const study = await studiesService.getStudy(id);
        if (!study)
            return res.status(404).json({
                error: 'Study not found',
            });
        return res.json(sanitizeStudy(study));
    } catch (err) {
        next(err);
    }
}

export async function update(req, res, next) {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid id' });

        // JWT로 인증된 studyId가 요청 대상과 동일한지 확인
        const tokenStudyId = req.user?.studyId;
        if (!tokenStudyId || tokenStudyId !== id) {
            return res.status(403).json({
                error: 'Forbidden',
            });
        }

        const { nickname, name, description, background, newPassword } = req.body || {};

        const data = {};
        if (typeof nickname === 'string') data.nickname = nickname;
        if (typeof name === 'string') data.name = name;
        if (typeof description === 'string') data.description = description;
        if (typeof background === 'string') data.background = background;
        if (typeof newPassword === 'string' && newPassword.length > 0)
            data.newPassword = newPassword;
        if (Object.keys(data).length === 0)
            return res.status(400).json({
                error: 'No updatable fields provided',
            });

        const updated = await studiesService.updateStudy(id, data);
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
}

export async function incrementPoints(req, res, next) {
    try {
        const id = parseId(req.params.id);
        if (!id)
            return res.status(400).json({
                error: 'Invalid id',
            });
        const inc = Number(req.body?.increment);
        if (!Number.isInteger(inc) || inc < 0)
            return res.status(400).json({
                error: 'increment must be a positive integer',
            });
        const updated = await studiesService.incrementPoints(id, inc);
        return res.json(sanitizeStudy(updated));
    } catch (err) {
        next(err);
    }
}

export async function remove(req, res, next) {
    try {
        const id = parseId(req.params.id);
        if (!id)
            return res.status(400).json({
                error: 'Invalid id',
            });
        // JWT로 인증된 studyId가 요청 대상과 동일한지 확인
        const tokenStudyId = req.user?.studyId;
        if (!tokenStudyId || tokenStudyId !== id) {
            return res.status(403).json({
                error: 'Forbidden',
            });
        }
        await studiesService.deleteStudy(id);
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
}
