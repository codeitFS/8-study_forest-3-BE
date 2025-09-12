import { verifyAccessToken } from '../services/tokenService.js';

// 인증 미들웨어
// 1. Authorization 헤더에서 Bearer 토큰 추출
// 2. 토큰 검증 실패 -> 401
// 3. 성공 시 req.user 에 payload(studyId 등) 주입 후 다음 처리
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
