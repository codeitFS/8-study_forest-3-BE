import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import pkg from 'pg';

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

// 404 처리
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// 에러 핸들러
app.use((err, req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT} (env: ${process.env.NODE_ENV || 'development'})`,
    );
});

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// 앱 시작 시 간단한 쿼리로 확인
(async () => {
    try {
        const { rows } = await pool.query('select now()');
        console.log('DB connected. now():', rows[0].now);
    } catch (e) {
        console.error('DB connect error:', e.message);
    }
})();

export default app;
