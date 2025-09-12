import cron from 'node-cron';
import { prisma } from '../repositories/prismaClient.js';
import { CRON_TZ } from '../config/index.js';

// node-cron 기반 주기 작업 스케줄러
// 현재 작업:
// 1) dev heartbeat: 개발 환경에서 주기 로그로 프로세스 생존 확인
// 2) 주간 습관 초기화: 매주 월요일 00:00 에 habits.weeklyClear 리셋

const g = globalThis;
g.__jobs = g.__jobs || [];

function register(job) {
    g.__jobs.push(job);
    return job;
}

// 서버 idle 상태 방지
function scheduleDevHeartbeat() {
    if (process.env.NODE_ENV === 'production') return null;
    return register(
        cron.schedule(
            '*/14 * * * *', // 14분 간격 (무료 호스팅 슬립 방지 목적 추정)
            () => {
                // eslint-disable-next-line no-console
                console.log('[cron] dev heartbeat:', new Date().toISOString());
            },
            { timezone: CRON_TZ },
        ),
    );
}

// 일주일마다 습관 초기화
function scheduleWeeklyHabitReset() {
    const DEFAULT_WEEKLY = '0|0|0|0|0|0|0';
    return register(
        cron.schedule(
            '0 0 * * 1', // 매주 월요일 00:00
            async () => {
                try {
                    const result = await prisma.habit.updateMany({
                        data: { weeklyClear: DEFAULT_WEEKLY },
                    });
                    // eslint-disable-next-line no-console
                    console.log('[cron] weekly habit reset done. count:', result.count);
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error('[cron] weekly habit reset error:', e);
                }
            },
            { timezone: CRON_TZ },
        ),
    );
}

export function startScheduler() {
    if (g.__schedulerStarted) return;
    g.__schedulerStarted = true;
    scheduleDevHeartbeat();
    scheduleWeeklyHabitReset();
    // eslint-disable-next-line no-console
    console.log('[cron] Scheduler started');
}

export function stopScheduler() {
    for (const job of g.__jobs) {
        try {
            job.stop();
        } catch {}
    }
    g.__jobs = [];
    g.__schedulerStarted = false;
    // eslint-disable-next-line no-console
    console.log('[cron] Scheduler stopped');
}
