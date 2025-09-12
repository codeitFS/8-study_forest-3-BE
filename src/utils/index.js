import { prisma } from '../repositories/prismaClient.js';
import { verifyPassword, hashPassword, isHashed } from './password.js';

// 문자열/숫자 파라미터를 양의 정수 id 로 변환 (실패 시 null)
export function parseId(param) {
    const id = Number(param);
    return Number.isInteger(id) && id > 0 ? id : null;
}

// 스터디 비밀번호 검증 유틸
// 반환: { ok:true } 또는 { ok:false, code:<HTTP Status>, message:<사유> }
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
    return { ok: true };
}

// 기존 값이 이미 해시인지 검사 후 필요 시 해싱 (마이그레이션 / 재사용 유틸)
export async function toHashedPasswordIfNeeded(plainOrHashed) {
    if (!plainOrHashed) return plainOrHashed;
    if (isHashed(plainOrHashed)) return plainOrHashed;
    return hashPassword(plainOrHashed);
}
