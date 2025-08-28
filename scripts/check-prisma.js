import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.$queryRaw`SELECT 1 as ok`;
        console.log('Prisma connected. Test query result:', result);
        process.exitCode = 0;
    } catch (err) {
        console.error('Prisma connection failed:', err.message);
        if (err.stack) console.error(err.stack);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

main();
