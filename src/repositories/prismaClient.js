import { PrismaClient } from '@prisma/client';

const g = globalThis;
/** @type {PrismaClient | undefined} */
let prismaInstance = g.__prisma;

if (!prismaInstance) {
    prismaInstance = new PrismaClient();
    g.__prisma = prismaInstance;
}

export const prisma = prismaInstance;
