import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

/** @type {PrismaClient | undefined} */
let prismaInstance = globalForPrisma.__prisma;

if (!prismaInstance) {
    prismaInstance = new PrismaClient();
    globalForPrisma.__prisma = prismaInstance;
}

export const prisma = prismaInstance;
