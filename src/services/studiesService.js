import { prisma } from '../repositories/prismaClient.js';
import { toHashedPasswordIfNeeded } from '../utils/index.js';

export async function createStudy({ nickname, name, description, background, password }) {
    const hashed = await toHashedPasswordIfNeeded(password);
    return prisma.study.create({
        data: { nickname, name, description, background, password: hashed },
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
        }),
    ]);
    return { total, items };
}

export function getStudy(id) {
    return prisma.study.findUnique({ where: { id } });
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
    });
}

export function incrementPoints(id, inc) {
    return prisma.study.update({
        where: { id },
        data: { points: { increment: inc } },
    });
}

export function deleteStudy(id) {
    return prisma.study.delete({
        where: { id },
    });
}
