import { prisma } from '../repositories/prismaClient.js';

export function create({ studyId, duration }) {
    return prisma.focusSession.create({
        data: { studyId, ...(duration !== undefined ? { duration } : {}) },
    });
}

export function get(studyId) {
    return prisma.focusSession.findUnique({ where: { studyId } });
}

export function update(studyId, data) {
    return prisma.focusSession.update({ where: { studyId }, data });
}

export function remove(studyId) {
    return prisma.focusSession.delete({ where: { studyId } });
}
