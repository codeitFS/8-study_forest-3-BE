// Import emojis from emoji-datasource JSON into Prisma DB
// Usage: node scripts/import-emojis.js <path-to-emoji.json>
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma } from '../src/lib/prisma.js';

function toEmojiFromUnified(unified) {
    if (!unified || typeof unified !== 'string') return '';
    try {
        const codePoints = unified
            .split('-')
            .filter(Boolean)
            .map((h) => parseInt(h, 16));
        return String.fromCodePoint(...codePoints);
    } catch {
        return '';
    }
}

async function main() {
    const [, , jsonPathArg] = process.argv;
    if (!jsonPathArg) {
        console.error('Provide path to emoji JSON from emoji-datasource');
        process.exit(1);
    }
    const resolved = path.resolve(jsonPathArg);
    const raw = await fs.readFile(resolved, 'utf-8');
    const data = JSON.parse(raw);

    // Expect either array of objects with unified field, or nested by groups
    let rows = [];
    if (Array.isArray(data)) {
        rows = data;
    } else if (data && typeof data === 'object') {
        // try common structures: { emojis: [...] } or { data: [...] }
        rows = Array.isArray(data.emojis) ? data.emojis : Array.isArray(data.data) ? data.data : [];
    }

    const mapped = rows
        .map((e) => {
            const unified = (e.unified || e.unicode || e.id || '').toString().toUpperCase();
            const emoji = e.emoji || toEmojiFromUnified(unified);
            if (!unified || !emoji) return null;
            return { id: unified, emoji };
        })
        .filter(Boolean);

    const uniqueMap = new Map();
    for (const r of mapped) {
        if (!uniqueMap.has(r.id)) uniqueMap.set(r.id, r);
    }
    const list = Array.from(uniqueMap.values());
    if (list.length === 0) {
        console.log('No valid emoji rows.');
        return;
    }

    console.log(`Preparing to insert ${list.length} emojis...`);

    // chunked insert to avoid parameter limits
    const chunkSize = 1000;
    let inserted = 0;
    for (let i = 0; i < list.length; i += chunkSize) {
        const chunk = list.slice(i, i + chunkSize);
        const res = await prisma.emoji.createMany({ data: chunk, skipDuplicates: true });
        inserted += res.count || 0;
    }

    console.log(`Done. Inserted ${inserted} new emojis.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
