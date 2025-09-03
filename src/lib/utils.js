import { prisma } from './prisma.js';
import { verifyPassword, hashPassword, isHashed } from './password.js';

// 공통: ID 파싱 (1부터 auto increment니까 양의 정수만 OK)
export function parseId(param) {
    const id = Number(param);
    return Number.isInteger(id) && id > 0 ? id : null;
}

// 공통: Study 비밀번호 검증
// 반환: 성공 { ok: true } 또는 실패 { ok: false, code: <httpCode>, message: <string> }
export async function verifyStudyPassword(studyId, password) {
    if (!password)
        return {
            ok: false,
            code: 400,
            message: 'password is required',
        };
    const study = await prisma.study.findUnique({
        where: { id: studyId },
        select: { id: true, password: true },
    });
    if (!study)
        return {
            ok: false,
            code: 404,
            message: 'Study not found',
        };
    const valid = await verifyPassword(password, study.password);
    if (!valid)
        return {
            ok: false,
            code: 403,
            message: 'Invalid password',
        };
    return {
        ok: true,
    };
}

// 저장 전 비밀번호를 해시로 변환 (이미 해시된 값은 통과)
export async function toHashedPasswordIfNeeded(plainOrHashed) {
    if (!plainOrHashed) return plainOrHashed;
    if (isHashed(plainOrHashed)) return plainOrHashed;
    return hashPassword(plainOrHashed);
}
