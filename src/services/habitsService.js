import { prisma } from '../repositories/prismaClient.js';

export function createHabit(studyId, { name, weeklyClear }) {
    return prisma.habit.create({
        data: {
            studyId,
            name,
            ...(weeklyClear ? { weeklyClear } : {}),
        },
    });
}

export function listHabits(studyId, { page, pageSize, search }) {
    const where = {
        studyId,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    };
    return prisma.habit.findMany({
        where,
        orderBy: { id: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
    });
}

export function getHabit(id) {
    return prisma.habit.findUnique({ where: { id } });
}

export function updateHabit(id, data) {
    return prisma.habit.update({ where: { id }, data });
}

export function deleteHabit(id) {
    return prisma.habit.delete({ where: { id } });
}
