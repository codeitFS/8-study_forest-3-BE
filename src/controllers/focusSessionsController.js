import * as focusService from '../services/focusSessionsService.js';
import { parseId } from '../utils/index.js';

export async function create(req, res, next) {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId)
            return res.status(400).json({
                error: 'Invalid studyId',
            });
        const { duration } = req.body || {};
        // JWT로 인증된 studyId가 요청 대상과 동일한지 확인
        const tokenStudyId = req.user?.studyId;
        if (!tokenStudyId || tokenStudyId !== studyId) {
            return res.status(403).json({
                error: 'Forbidden',
            });
        }
        const payload = { studyId };
        if (duration !== undefined) {
            const d = Number(duration);
            if (!Number.isInteger(d) || d < 0)
                return res.status(400).json({
                    error: 'duration must be a non-negative integer',
                });
            payload.duration = d;
        }
        const created = await focusService.create(payload);
        return res.status(201).json(created);
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                error: 'FocusSession already exists for this study',
            });
        }
        next(err);
    }
}

export async function get(req, res, next) {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId)
            return res.status(400).json({
                error: 'Invalid studyId',
            });
        const fs = await focusService.get(studyId);
        if (!fs)
            return res.status(404).json({
                error: 'FocusSession not found',
            });
        return res.json(fs);
    } catch (err) {
        next(err);
    }
}

export async function update(req, res, next) {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId)
            return res.status(400).json({
                error: 'Invalid studyId',
            });
        const { duration } = req.body || {};
        const tokenStudyId = req.user?.studyId;
        if (!tokenStudyId || tokenStudyId !== studyId) {
            return res.status(403).json({
                error: 'Forbidden',
            });
        }
        if (duration === undefined)
            return res.status(400).json({
                error: 'duration is required',
            });
        const d = Number(duration);
        if (!Number.isInteger(d) || d < 0)
            return res.status(400).json({
                error: 'duration must be a non-negative integer',
            });
        const existing = await focusService.get(studyId);
        if (!existing)
            return res.status(404).json({
                error: 'FocusSession not found',
            });
        const updated = await focusService.update(studyId, { duration: d });
        return res.json(updated);
    } catch (err) {
        next(err);
    }
}

export async function remove(req, res, next) {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId)
            return res.status(400).json({
                error: 'Invalid studyId',
            });
        const tokenStudyId = req.user?.studyId;
        if (!tokenStudyId || tokenStudyId !== studyId) {
            return res.status(403).json({
                error: 'Forbidden',
            });
        }
        const existing = await focusService.get(studyId);
        if (!existing)
            return res.status(404).json({
                error: 'FocusSession not found',
            });
        await focusService.remove(studyId);
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
}
