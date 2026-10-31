import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const requiredKeys = ['DB_HOST', 'DB_USER', 'DB_NAME', 'DB_PASSWORD', 'SESSION_SECRET'];
const missingKeys = requiredKeys.filter((key) => !process.env[key]);

if (missingKeys.length) {
  console.error(`Missing backend settings: ${missingKeys.join(', ')}.`);
  console.error('Copy backend/.env.example to backend/.env and complete the values.');
  process.exit(1);
}

if (process.env.DB_PASSWORD.startsWith('replace-with-')) {
  console.error('Set DB_PASSWORD in backend/.env to the password for the MySQL user in DB_USER.');
  process.exit(1);
}

if (process.env.SESSION_SECRET.length < 32) {
  console.error('SESSION_SECRET must be at least 32 characters. Generate one with: openssl rand -base64 48');
  process.exit(1);
}

// Render terminates HTTPS at its proxy and injects RENDER_SERVICE_ID. Treat it
// as production even if NODE_ENV was omitted in the service dashboard.
const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER_SERVICE_ID);
const cookieSameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');
const cookieSecure = process.env.COOKIE_SECURE === undefined
  ? isProduction
  : process.env.COOKIE_SECURE.toLowerCase() === 'true';
const dbSslMode = process.env.DB_SSL_MODE || (
  ['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST) ? 'disabled' : 'required'
);

if (!['lax', 'strict', 'none'].includes(cookieSameSite)) {
  throw new Error('COOKIE_SAME_SITE must be lax, strict, or none.');
}
if (process.env.COOKIE_SECURE !== undefined && !['true', 'false'].includes(process.env.COOKIE_SECURE.toLowerCase())) {
  throw new Error('COOKIE_SECURE must be true or false.');
}
if (cookieSameSite === 'none' && !isProduction) {
  throw new Error('SameSite=None cookies require HTTPS; use COOKIE_SAME_SITE=lax in development.');
}
if (cookieSameSite === 'none' && !cookieSecure) {
  throw new Error('COOKIE_SECURE=true is required when COOKIE_SAME_SITE=none.');
}
const frontendOrigins = (process.env.FRONTEND_ORIGINS || (isProduction ? '' : 'http://localhost:5173,http://127.0.0.1:5173'))
  .split(',').map((origin) => origin.trim()).filter(Boolean);
if (isProduction && frontendOrigins.length === 0) {
  throw new Error('Set FRONTEND_ORIGINS to the exact frontend origin in production.');
}
if (!['disabled', 'required', 'verify-ca'].includes(dbSslMode)) {
  throw new Error('DB_SSL_MODE must be disabled, required, or verify-ca.');
}
if (dbSslMode === 'verify-ca' && !process.env.DB_SSL_CA_PATH && !process.env.DB_SSL_CA) {
  throw new Error('Set DB_SSL_CA_PATH or DB_SSL_CA when DB_SSL_MODE=verify-ca.');
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: Number(process.env.PORT || process.env.API_PORT || 3001),
  frontendOrigins,
  cookieSameSite,
  cookieSecure,
  sessionCookieMaxAgeMs: 7 * 24 * 60 * 60 * 1000,
  sessionSecret: process.env.SESSION_SECRET,
  database: Object.freeze({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    sslMode: dbSslMode,
    sslCaPath: process.env.DB_SSL_CA_PATH || '',
    sslCa: process.env.DB_SSL_CA || '',
  }),
});
