import { prisma } from '../repositories/prismaClient.js';

// 습관 생성
export function createHabit(studyId, { name, weeklyClear }) {
    return prisma.habit.create({
        data: {
            studyId,
            name,
            ...(weeklyClear ? { weeklyClear } : {}),
        },
    });
}

// 습관 목록 (검색 + 페이지네이션)
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

// 단건 조회
export function getHabit(id) {
    return prisma.habit.findUnique({ where: { id } });
}

// 업데이트
export function updateHabit(id, data) {
    return prisma.habit.update({ where: { id }, data });
}

// 삭제
export function deleteHabit(id) {
    return prisma.habit.delete({ where: { id } });
}
