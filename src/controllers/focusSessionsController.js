import * as focusService from '../services/focusSessionsService.js';
import { parseId, verifyStudyPassword } from '../utils/index.js';

export async function create(req, res, next) {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId) return res.status(400).json({ error: 'Invalid studyId' });
        const { password, duration } = req.body || {};
        const auth = await verifyStudyPassword(studyId, password);
        if (!auth.ok) return res.status(auth.code).json({ error: auth.message });
        const payload = { studyId };
        if (duration !== undefined) {
            const d = Number(duration);
            if (!Number.isInteger(d) || d < 0)
                return res.status(400).json({ error: 'duration must be a non-negative integer' });
            payload.duration = d;
        }
        const created = await focusService.create(payload);
        return res.status(201).json(created);
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({ error: 'FocusSession already exists for this study' });
        }
        next(err);
    }
}

export async function get(req, res, next) {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId) return res.status(400).json({ error: 'Invalid studyId' });
        const fs = await focusService.get(studyId);
        if (!fs) return res.status(404).json({ error: 'FocusSession not found' });
        return res.json(fs);
    } catch (err) {
        next(err);
    }
}

export async function update(req, res, next) {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId) return res.status(400).json({ error: 'Invalid studyId' });
        const { password, duration } = req.body || {};
        const auth = await verifyStudyPassword(studyId, password);
        if (!auth.ok) return res.status(auth.code).json({ error: auth.message });
        if (duration === undefined) return res.status(400).json({ error: 'duration is required' });
        const d = Number(duration);
        if (!Number.isInteger(d) || d < 0)
            return res.status(400).json({ error: 'duration must be a non-negative integer' });
        const existing = await focusService.get(studyId);
        if (!existing) return res.status(404).json({ error: 'FocusSession not found' });
        const updated = await focusService.update(studyId, { duration: d });
        return res.json(updated);
    } catch (err) {
        next(err);
    }
}

export async function remove(req, res, next) {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId) return res.status(400).json({ error: 'Invalid studyId' });
        const { password } = req.body || {};
        const auth = await verifyStudyPassword(studyId, password);
        if (!auth.ok) return res.status(auth.code).json({ error: auth.message });
        const existing = await focusService.get(studyId);
        if (!existing) return res.status(404).json({ error: 'FocusSession not found' });
        await focusService.remove(studyId);
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
}
