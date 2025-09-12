import { parseId, verifyStudyPassword } from '../utils/index.js';
import { signAccessToken } from '../services/tokenService.js';
import { JWT_ACCESS_EXPIRES_IN } from '../config/auth.js';

// POST /auth
// 1. studyId + password 검증 (형식 및 존재)
// 2. 비밀번호 검증 util 사용 (해시 비교 포함)
// 3. Access Token 발급 후 만료 정보와 함께 반환
export async function issueAccessToken(req, res) {
    const studyId = parseId(req.body?.studyId);
    const password = req.body?.password;

    if (!studyId)
        return res.status(400).json({
            error: 'Invalid studyId',
        });
    if (!password)
        return res.status(400).json({
            error: 'password is required',
        });

    const result = await verifyStudyPassword(studyId, password);
    if (!result.ok)
        return res.status(result.code).json({
            error: result.message,
        });

    const token = signAccessToken({ studyId });

    return res.status(200).json({
        ok: true,
        token,
        tokenType: 'Bearer',
        expiresIn: JWT_ACCESS_EXPIRES_IN,
    });
}
