import { prisma } from '../repositories/prismaClient.js';
import { toHashedPasswordIfNeeded } from '../utils/index.js';

// study와 관련된 emoji들을 불러오도록 하는 모듈
const includeStudyEmojis = {
    studyEmojis: {
        include: { emoji: true },
        orderBy: [{ count: 'desc' }, { emojiId: 'asc' }],
    },
};

export async function createStudy({ nickname, name, description, background, password }) {
    const hashed = await toHashedPasswordIfNeeded(password);
    return prisma.study.create({
        data: { nickname, name, description, background, password: hashed },
        include: includeStudyEmojis,
    });
}

export async function listStudies({ page, pageSize, search }) {
    const where = search
        ? {
              OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { nickname: { contains: search, mode: 'insensitive' } },
              ],
          }
        : undefined;
    const [total, items] = await Promise.all([
        prisma.study.count({ where }),
        prisma.study.findMany({
            where,
            orderBy: { id: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: includeStudyEmojis,
        }),
    ]);
    return { total, items };
}

export async function listAllStudies({ search }) {
    const where = search
        ? {
              OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { nickname: { contains: search, mode: 'insensitive' } },
              ],
          }
        : undefined;
    return prisma.study.findMany({
        where,
        orderBy: { id: 'desc' },
        include: includeStudyEmojis,
    });
}

export function getStudy(id) {
    return prisma.study.findUnique({ where: { id }, include: includeStudyEmojis });
}

export async function updateStudy(id, { nickname, name, description, background, newPassword }) {
    const data = {};
    if (nickname !== undefined) data.nickname = nickname;
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (background !== undefined) data.background = background;
    if (newPassword !== undefined) data.password = await toHashedPasswordIfNeeded(newPassword);
    return prisma.study.update({
        where: { id },
        data,
        include: includeStudyEmojis,
    });
}

export function incrementPoints(id, inc) {
    return prisma.study.update({
        where: { id },
        data: { points: { increment: inc } },
        include: includeStudyEmojis,
    });
}

export function deleteStudy(id) {
    return prisma.study.delete({
        where: { id },
    });
}
