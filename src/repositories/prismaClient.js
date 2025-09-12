import { PrismaClient } from '@prisma/client';

// PrismaClient 는 다중 import 시 새 커넥션을 계속 생성하면 성능/커넥션 한도 문제가 발생할 수 있음.
// 따라서 글로벌 객체에 1회만 생성하여 재사용 (Hot Reload / dev 환경에서도 안전)
const g = globalThis;
/** @type {PrismaClient | undefined} */
let prismaInstance = g.__prisma;

if (!prismaInstance) {
    prismaInstance = new PrismaClient(); // 최초 1회 생성
    g.__prisma = prismaInstance; // 글로벌 캐시
}

// 서비스/컨트롤러 계층에서 import 하여 사용
export const prisma = prismaInstance;
