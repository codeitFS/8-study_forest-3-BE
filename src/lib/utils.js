import { prisma } from './prisma.js';

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
    if (study.password !== password)
        return {
            ok: false,
            code: 403,
            message: 'Invalid password',
        };
    return {
        ok: true,
    };
}
