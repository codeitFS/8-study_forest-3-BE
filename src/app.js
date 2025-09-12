import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { LOG_LEVEL } from './config/index.js';

// 애플리케이션의 핵심 Express 인스턴스 생성
// 계층 구조: (요청) -> 글로벌 미들웨어(helmet, cors, logging, body parser) -> 라우터 -> 404 -> 에러 핸들러
// 각 기능 라우트는 src/routes/* 에 정의되어 있으며 controllers/service/prisma 로 이어지는 레이어드 아키텍처

const app = express();

// ----- Global Middlewares -----
// helmet: 공통 보안 헤더 설정 (XSS / MIME sniffing 보호 등)
app.use(helmet());
// cors: 브라우저 Cross-Origin 접근 허용 (기본은 전체 허용, 필요 시 옵션 확장 가능)
app.use(cors());
// morgan: HTTP 요청 로깅 (LOG_LEVEL env 로 모드 제어)
app.use(morgan(LOG_LEVEL));
// Body Parser: JSON / URL-Encoded 폼 데이터 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base routes
// 헬스체크 / 루트 엔드포인트: 간단한 애플리케이션 상태 응답
app.get('/', (_req, res) => {
    res.json({ ok: true, message: 'Express skeleton' });
});

// /health: 모니터링/배포 환경에서 상태 확인 용도. DB 체크는 server.js 에서 별도 수행
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ----- Feature Routes -----
// 단일 index 라우터에서 각 도메인(studies, habits, focusSessions, emojis, auth) 서브 라우터를 조합
app.use('/', routes);

// 404 핸들러: 라우트 미스(match 실패)시 실행 (next 호출 없는 마지막 미들웨어)
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// 공통 에러 핸들러: 처리되지 않은 예외 로깅 후 500 응답
// (컨트롤러에서 명시적으로 status 반환한 경우는 이쪽으로 오지 않음)
app.use((err, _req, res, _next) => {
    console.error(err); // 운영환경에서는 구조화 로깅/마스킹 고려 가능
    res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
