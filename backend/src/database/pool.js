import mysql from 'mysql2/promise';
import { readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

const { name: database, sslMode, sslCaPath, sslCa, ...connectionSettings } = env.database;
const backendDirectory = fileURLToPath(new URL('../../', import.meta.url));
const caPath = sslCaPath
  ? (isAbsolute(sslCaPath) ? sslCaPath : resolve(backendDirectory, sslCaPath))
  : '';
const ssl = sslMode === 'disabled'
  ? undefined
  : sslMode === 'verify-ca'
    ? {
      ca: sslCaPath ? readFileSync(caPath) : sslCa.replace(/\\n/g, '\n'),
      rejectUnauthorized: true,
    }
    : { rejectUnauthorized: false };

export const pool = mysql.createPool({
  ...connectionSettings,
  database,
  ...(ssl ? { ssl } : {}),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});
