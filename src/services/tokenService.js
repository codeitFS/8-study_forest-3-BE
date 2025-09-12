import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRES_IN } from '../config/auth.js';

// Access Token 발급 함수
// payload: 토큰에 포함할 최소 정보 (여기서는 studyId 만 사용)
// expiresIn: 만료 시간 (환경변수로 제어)
export function signAccessToken(payload, options = {}) {
    const expiresIn = JWT_ACCESS_EXPIRES_IN;
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn });
}

// Access Token 검증
// 성공 시 payload(payload: { studyId, iat, exp }) 반환
// 실패 시 ok:false 와 error 객체 반환 -> 미들웨어에서 401 처리
export function verifyAccessToken(token) {
    try {
        return { ok: true, payload: jwt.verify(token, JWT_ACCESS_SECRET) };
    } catch (err) {
        return { ok: false, error: err };
    }
}
