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

const sameSite = process.env.COOKIE_SAME_SITE || 'lax';
const isProduction = process.env.NODE_ENV === 'production';

if (!['lax', 'strict', 'none'].includes(sameSite)) {
  throw new Error('COOKIE_SAME_SITE must be lax, strict, or none.');
}
if (sameSite === 'none' && !isProduction) {
  throw new Error('SameSite=None cookies require HTTPS; use COOKIE_SAME_SITE=lax in development.');
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: Number(process.env.API_PORT || 3001),
  frontendOrigins: (process.env.FRONTEND_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',').map((origin) => origin.trim()).filter(Boolean),
  cookieSameSite: sameSite,
  sessionSecret: process.env.SESSION_SECRET,
  database: Object.freeze({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  }),
});
