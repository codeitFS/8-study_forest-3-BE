import dotenv from 'dotenv';
import app from './app.js';
import { startScheduler } from './jobs/scheduler.js';
import { Pool } from 'pg';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT} (env: ${process.env.NODE_ENV || 'development'})`,
    );
    startScheduler();
});

// DB 연결 확인
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

(async () => {
    try {
        const { rows } = await pool.query('select now()');
        console.log('DB connected. now():', rows[0].now);
    } catch (e) {
        console.error('DB connect error:', e.message);
    }
})();
