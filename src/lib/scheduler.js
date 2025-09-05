import cron from 'node-cron';
import { prisma } from './prisma.js';

// 스케줄러가 중복으로 등록되는 것을 방지
const globalRef = globalThis;
globalRef.__jobs = globalRef.__jobs || [];

function register(job) {
    globalRef.__jobs.push(job);
    return job;
}

// 14분마다 헬스 체크 (개발 모드에서만 동작)
function scheduleDevHeartbeat() {
    if (process.env.NODE_ENV === 'production') return null;
    return register(
        cron.schedule(
            '*/14 * * * *',
            () => {
                console.log('[cron] dev heartbeat:', new Date().toISOString());
            },
            { timezone: process.env.CRON_TZ || 'Asia/Seoul' }, // 타임존 설정
        ),
    );
}

// 매주 월요일 00:00 모든 습관 weeklyClear 초기화
function scheduleWeeklyHabitReset() {
    const DEFAULT_WEEKLY = '0|0|0|0|0|0|0';
    return register(
        cron.schedule(
            '0 0 * * 1',
            //'* * * * *',
            async () => {
                try {
                    const result = await prisma.habit.updateMany({
                        data: { weeklyClear: DEFAULT_WEEKLY },
                    });
                    console.log('[cron] weekly habit reset done. count:', result.count);
                } catch (e) {
                    console.error('[cron] weekly habit reset error:', e);
                }
            },
            { timezone: process.env.CRON_TZ || 'Asia/Seoul' },
        ),
    );
}

export function startScheduler() {
    if (globalRef.__schedulerStarted) return; // 중복 시작 방지
    globalRef.__schedulerStarted = true;
    scheduleDevHeartbeat();
    scheduleWeeklyHabitReset();

    console.log('[cron] Scheduler started');
}

export function stopScheduler() {
    for (const job of globalRef.__jobs) {
        try {
            job.stop();
        } catch {}
    }
    globalRef.__jobs = [];
    globalRef.__schedulerStarted = false;
    console.log('[cron] Scheduler stopped');
}
