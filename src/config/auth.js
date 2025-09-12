// JWT 관련 환경변수 설정
// JWT_ACCESS_SECRET: 서명 시 사용되는 비밀키 (반드시 안전하게 관리)
// JWT_ACCESS_EXPIRES_IN: 만료 기간 (예: '1h', '7d')
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
export const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
