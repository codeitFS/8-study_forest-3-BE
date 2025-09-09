import { parseId, verifyStudyPassword } from '../utils/index.js';
import { signAccessToken } from '../services/auth/tokenService.js';
import { JWT_ACCESS_EXPIRES_IN } from '../config/auth.js';

// POST /auth - id/pw를 이용해 엑세스 토큰 생성
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
