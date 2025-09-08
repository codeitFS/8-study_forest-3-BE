import * as habitsService from '../services/habitsService.js';
import { parseId, verifyStudyPassword } from '../utils/index.js';

function isValidWeeklyClear(value) {
    if (typeof value !== 'string') return false;
    return /^(0|1)(\|(0|1)){6}$/.test(value);
}

export async function create(req, res, next) {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId) return res.status(400).json({ error: 'Invalid studyId' });

        const { name, weeklyClear, password } = req.body || {};
        if (!name) return res.status(400).json({ error: 'name is required' });
        if (weeklyClear !== undefined && !isValidWeeklyClear(weeklyClear)) {
            return res.status(400).json({ error: 'weeklyClear must be like 0|0|0|0|0|0|0' });
        }

        const auth = await verifyStudyPassword(studyId, password);
        if (!auth.ok) return res.status(auth.code).json({ error: auth.message });

        const habit = await habitsService.createHabit(studyId, { name, weeklyClear });
        return res.status(201).json(habit);
    } catch (err) {
        next(err);
    }
}

export async function list(req, res, next) {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId) return res.status(400).json({ error: 'Invalid studyId' });
        const page = Math.max(1, Number(req.query.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
        const search = (req.query.search || '').toString().trim();
        const items = await habitsService.listHabits(studyId, { page, pageSize, search });
        return res.json(items);
    } catch (err) {
        next(err);
    }
}

export async function getById(req, res, next) {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId) return res.status(400).json({ error: 'Invalid studyId' });
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid id' });
        const habit = await habitsService.getHabit(id);
        if (!habit || habit.studyId !== studyId)
            return res.status(404).json({ error: 'Habit not found' });
        return res.json(habit);
    } catch (err) {
        next(err);
    }
}

export async function update(req, res, next) {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId) return res.status(400).json({ error: 'Invalid studyId' });
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid id' });

        const { password, name, weeklyClear } = req.body || {};
        const existing = await habitsService.getHabit(id);
        if (!existing || existing.studyId !== studyId)
            return res.status(404).json({ error: 'Habit not found' });

        const auth = await verifyStudyPassword(studyId, password);
        if (!auth.ok) return res.status(auth.code).json({ error: auth.message });

        const data = {};
        if (typeof name === 'string') data.name = name;
        if (weeklyClear !== undefined) {
            if (!isValidWeeklyClear(weeklyClear))
                return res.status(400).json({ error: 'weeklyClear must be like 0|0|0|0|0|0|0' });
            data.weeklyClear = weeklyClear;
        }
        if (Object.keys(data).length === 0)
            return res.status(400).json({ error: 'No updatable fields provided' });

        const updated = await habitsService.updateHabit(id, data);
        return res.json(updated);
    } catch (err) {
        next(err);
    }
}

export async function remove(req, res, next) {
    try {
        const studyId = parseId(req.params.studyId);
        if (!studyId) return res.status(400).json({ error: 'Invalid studyId' });
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid id' });

        const { password } = req.body || {};
        const existing = await habitsService.getHabit(id);
        if (!existing || existing.studyId !== studyId)
            return res.status(404).json({ error: 'Habit not found' });

        const auth = await verifyStudyPassword(studyId, password);
        if (!auth.ok) return res.status(auth.code).json({ error: auth.message });

        await habitsService.deleteHabit(id);
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
}
