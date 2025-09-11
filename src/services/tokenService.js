import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRES_IN } from '../config/auth.js';

// Access token 발급
export function signAccessToken(payload, options = {}) {
    const expiresIn = JWT_ACCESS_EXPIRES_IN;
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn });
}

// Access token 검증
export function verifyAccessToken(token) {
    try {
        return { ok: true, payload: jwt.verify(token, JWT_ACCESS_SECRET) };
    } catch (err) {
        return { ok: false, error: err };
    }
}
