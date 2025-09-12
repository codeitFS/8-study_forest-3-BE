import { prisma } from '../repositories/prismaClient.js';
import { toHashedPasswordIfNeeded } from '../utils/index.js';

// Prisma include 설정: study 조회 시 연관된 StudyEmoji (이모지별 카운트) 로드
// orderBy: count 내림차순 -> 동일 count 시 emojiId 오름차순
const includeStudyEmojis = {
    studyEmojis: {
        include: { emoji: true },
        orderBy: [{ count: 'desc' }, { emojiId: 'asc' }],
    },
};

// 스터디 생성 - password 는 필요 시 해싱 처리
export async function createStudy({ nickname, name, description, background, password }) {
    const hashed = await toHashedPasswordIfNeeded(password);
    return prisma.study.create({
        data: { nickname, name, description, background, password: hashed },
        include: includeStudyEmojis,
    });
}

// 페이지네이션 + 검색 (name, nickname 부분 일치 - 대소문자 무시)
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

// 전체 조회 (주의: 데이터 커지면 비효율 -> 향후 제한/캐시 고려)
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

// 단건 조회
export function getStudy(id) {
    return prisma.study.findUnique({ where: { id }, include: includeStudyEmojis });
}

// 업데이트 (선택적 필드만 적용, newPassword 존재 시 재해싱)
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

// 포인트 증가 (경합 상황에서 atomic increment)
export function incrementPoints(id, inc) {
    return prisma.study.update({
        where: { id },
        data: { points: { increment: inc } },
        include: includeStudyEmojis,
    });
}

// 삭제 (연관 관계 onDelete Cascade 설정으로 관련 레코드 정리)
export function deleteStudy(id) {
    return prisma.study.delete({
        where: { id },
    });
}
