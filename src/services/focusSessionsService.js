import { prisma } from '../repositories/prismaClient.js';

// 집중 세션 생성 (studyId 당 1개 - schema 에 unique)
export function create({ studyId, duration }) {
    return prisma.focusSession.create({
        data: { studyId, ...(duration !== undefined ? { duration } : {}) },
    });
}

// 조회
export function get(studyId) {
    return prisma.focusSession.findUnique({ where: { studyId } });
}

// 업데이트
export function update(studyId, data) {
    return prisma.focusSession.update({ where: { studyId }, data });
}

// 삭제
export function remove(studyId) {
    return prisma.focusSession.delete({ where: { studyId } });
}
