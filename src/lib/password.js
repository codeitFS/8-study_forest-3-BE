import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb);
const PREFIX = 'scrypt';

// 해시 형식: scrypt$<salt_b64>$<hash_b64>
export async function hashPassword(plain) {
    if (typeof plain !== 'string' || plain.length === 0) {
        throw new Error('Password must be a non-empty string');
    }
    const salt = randomBytes(16); // 128-bit salt
    const keyLen = 64; // 512-bit key
    const derivedKey = await scrypt(plain, salt, keyLen);
    const saltB64 = salt.toString('base64');
    const hashB64 = Buffer.from(derivedKey).toString('base64');
    return `${PREFIX}$${saltB64}$${hashB64}`;
}

export function isHashed(stored) {
    return typeof stored === 'string' && stored.startsWith(`${PREFIX}$`);
}

export async function verifyPassword(plain, stored) {
    if (typeof stored !== 'string' || stored.length === 0) return false;

    // 기존 평문 저장본과의 하위호환: 해시 프리픽스가 아니면 단순 비교
    if (!isHashed(stored)) {
        return plain === stored;
    }

    try {
        const [, saltB64, hashB64] = stored.split('$');
        if (!saltB64 || !hashB64) return false;
        const salt = Buffer.from(saltB64, 'base64');
        const saved = Buffer.from(hashB64, 'base64');
        const keyLen = saved.length || 64;
        const derivedKey = Buffer.from(await scrypt(plain, salt, keyLen));
        if (derivedKey.length !== saved.length) return false;
        return timingSafeEqual(derivedKey, saved);
    } catch {
        return false;
    }
}

export const password = { hashPassword, verifyPassword, isHashed };
