import cron from 'node-cron';

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

export function startScheduler() {
    if (globalRef.__schedulerStarted) return; // 중복 시작 방지
    globalRef.__schedulerStarted = true;
    scheduleDevHeartbeat();

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
