import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Environment variable ${name} is required but not set.`);

    return value;
}

function numberEnv(name: string, fallback: number): number {
    const value = process.env[name];
    if (!value) return fallback;

    const num = Number(value);
    if (!Number.isFinite(num)) throw new Error(`Environment variable ${name} must be a valid number.`);

    return num;
}

export const env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: numberEnv('PORT', 9999),
    jwtAccessSecret: required('JWT_ACCESS_TOKEN'),
    jwtRefreshSecret: required('JWT_REFRESH_TOKEN'),
    accessTokenTtlSeconds: numberEnv('ACCESS_TOKEN_TTL_SECONDS', 900),
    refreshTokenTtlSeconds: numberEnv('REFRESH_TOKEN_TTL_SECONDS', 9000),
    refreshCookieName: process.env.REFRESH_COOKIE_NAME ?? 'rt',
    mongoUri: required('MONGODB_URI'),
    mongoDB: required('MONGO_DB'),
} as const;
