import { prisma } from '../repositories/prismaClient.js';
import { verifyPassword, hashPassword, isHashed } from './password.js';

export function parseId(param) {
    const id = Number(param);
    return Number.isInteger(id) && id > 0 ? id : null;
}

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

export async function toHashedPasswordIfNeeded(plainOrHashed) {
    if (!plainOrHashed) return plainOrHashed;
    if (isHashed(plainOrHashed)) return plainOrHashed;
    return hashPassword(plainOrHashed);
}
