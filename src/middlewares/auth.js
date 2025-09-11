import { verifyAccessToken } from '../services/tokenService.js';

export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    let token = null;
    if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring('Bearer '.length);
    }

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { ok, payload } = verifyAccessToken(token);
    if (!ok) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = payload; // { studyId, iat, exp }
    return next();
}
