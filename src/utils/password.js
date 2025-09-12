import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

// Node 내장 scrypt 사용 (CPU 비용이 높은 Key Derivation 함수)
// 비밀번호 저장 형식: scrypt$<salt(base64)>$<hash(base64)>
const scrypt = promisify(scryptCb);
const PREFIX = 'scrypt';

// 비밀번호 해시 생성
export async function hashPassword(plain) {
    if (typeof plain !== 'string' || plain.length === 0) {
        throw new Error('Password must be a non-empty string');
    }
    const salt = randomBytes(16); // 128bit salt
    const keyLen = 64; // 파衍 key 길이 (조정 가능)
    const derivedKey = await scrypt(plain, salt, keyLen);
    const saltB64 = salt.toString('base64');
    const hashB64 = Buffer.from(derivedKey).toString('base64');
    return `${PREFIX}$${saltB64}$${hashB64}`;
}

// 저장된 문자열이 해시 포맷인지 여부
export function isHashed(stored) {
    return typeof stored === 'string' && stored.startsWith(`${PREFIX}$`);
}

// 비밀번호 검증
// 1) 해시 포맷이 아니면 (legacy/plain) 단순 비교
// 2) scrypt 재계산 후 timingSafeEqual 로 동일성 확인
export async function verifyPassword(plain, stored) {
    if (typeof stored !== 'string' || stored.length === 0) return false;
    if (!isHashed(stored)) {
        return plain === stored; // 마이그레이션 이전 데이터 호환
    }
    try {
        const [, saltB64, hashB64] = stored.split('$');
        if (!saltB64 || !hashB64) return false;
        const salt = Buffer.from(saltB64, 'base64');
        const saved = Buffer.from(hashB64, 'base64');
        const keyLen = saved.length || 64;
        const derivedKey = Buffer.from(await scrypt(plain, salt, keyLen));
        if (derivedKey.length !== saved.length) return false; // 길이 다르면 조기 실패
        return timingSafeEqual(derivedKey, saved); // 타이밍 공격 방어
    } catch {
        return false;
    }
}

export const password = { hashPassword, verifyPassword, isHashed };
