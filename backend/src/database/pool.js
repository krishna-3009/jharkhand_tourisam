import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const { name: database, ...connectionSettings } = env.database;

export const pool = mysql.createPool({
  ...connectionSettings,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});
