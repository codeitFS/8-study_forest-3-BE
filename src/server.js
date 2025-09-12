import dotenv from 'dotenv';
import app from './app.js';
import { startScheduler } from './jobs/scheduler.js';
import { Pool } from 'pg';

// 서버 엔트리 포인트
// 1. 환경변수 로드 (.env)
// 2. Express 앱 리스닝 시작
// 3. 스케줄러(cron) 기동
// 4. 간단한 DB 연결 테스트 수행 (Prisma 외 raw Pool 사용)

dotenv.config();

const PORT = Number(process.env.PORT || 3000); // 기본 포트 3000

app.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT} (env: ${process.env.NODE_ENV || 'development'})`,
    );
    // cron job 시작 (주기 작업: 습관 주간 초기화 등)
    startScheduler();
});

// ----- DB 연결 헬스체크 -----
// PrismaClient 와 별도로 pg Pool 로 직접 now() 쿼리하여 초기 연결 확인.
// (초기 cold start 시 Prisma 준비 이전 간단한 가시성 확보 목적)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

(async () => {
    try {
        const { rows } = await pool.query('select now()');
        console.log('DB connected. now():', rows[0].now); // DB 시간 로깅
    } catch (e) {
        console.error('DB connect error:', e.message); // 실패 시 에러 메시지 출력
    }
})();
