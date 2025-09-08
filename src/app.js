import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { LOG_LEVEL } from './config/index.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan(LOG_LEVEL));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base routes
app.get('/', (_req, res) => {
    res.json({ ok: true, message: 'Express skeleton' });
});

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Feature routes
app.use('/', routes);

// 에러 핸들러
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
