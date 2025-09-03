import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import pkg from 'pg';
import focusSessionsRouter from './src/routes/focusSessions.js';
import habitsRouter from './src/routes/habits.js';
import studiesRouter from './src/routes/studies.js';
import emojisRouter from './src/routes/emojis.js';
import { startScheduler } from './src/lib/scheduler.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const LOG_LEVEL = process.env.LOG_LEVEL || 'dev';

// 기본 미들웨어
app.use(helmet());
app.use(cors());
app.use(morgan(LOG_LEVEL));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우트 (루트 및 헬스체크)
app.get('/', (req, res) => {
    res.json({ ok: true, message: 'Express skeleton' });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 라우터
app.use('/', studiesRouter); // /studies ...
app.use('/', habitsRouter); // /studies/:studyId/habits
app.use('/', focusSessionsRouter); // /studies/:studyId/focus_session
app.use('/', emojisRouter); // /emojis, /studies/:studyId/emojis

// 에러 핸들러
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.use((err, req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// server 가동 및 CRON 스케줄러 시작(14분마다 ping)
app.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT} (env: ${process.env.NODE_ENV || 'development'})`,
    );
    startScheduler();
});

const { Pool } = pkg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// DB 확인
(async () => {
    try {
        const { rows } = await pool.query('select now()');
        console.log('DB connected. now():', rows[0].now);
    } catch (e) {
        console.error('DB connect error:', e.message);
    }
})();

export default app;
