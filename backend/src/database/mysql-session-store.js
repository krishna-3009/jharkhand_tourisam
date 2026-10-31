import session from 'express-session';
import { env } from '../config/env.js';

export class MySQLSessionStore extends session.Store {
  constructor(pool) {
    super();
    this.pool = pool;
    this.ready = pool.query('SELECT 1 FROM sessions LIMIT 0');
  }

  get(sessionId, callback) {
    this.pool.execute('SELECT expires, data FROM sessions WHERE session_id = ?', [sessionId])
      .then(async ([rows]) => {
        const row = rows[0];
        if (!row) return callback(null, null);
        if (Number(row.expires) <= Date.now()) {
          await this.pool.execute('DELETE FROM sessions WHERE session_id = ?', [sessionId]);
          return callback(null, null);
        }
        try {
          callback(null, JSON.parse(row.data));
        } catch (error) {
          callback(error);
        }
      })
      .catch(callback);
  }

  set(sessionId, value, callback = () => {}) {
    const cookieExpiry = value.cookie?.expires ? new Date(value.cookie.expires).getTime() : null;
    const expires = cookieExpiry && Number.isFinite(cookieExpiry)
      ? cookieExpiry
      : Date.now() + env.sessionCookieMaxAgeMs;
    this.pool.execute(
      `INSERT INTO sessions (session_id, expires, data) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE expires = VALUES(expires), data = VALUES(data)`,
      [sessionId, expires, JSON.stringify(value)],
    ).then(() => callback(null)).catch(callback);
  }

  touch(sessionId, value, callback = () => {}) {
    const cookieExpiry = value.cookie?.expires ? new Date(value.cookie.expires).getTime() : null;
    const expires = cookieExpiry && Number.isFinite(cookieExpiry)
      ? cookieExpiry
      : Date.now() + env.sessionCookieMaxAgeMs;
    this.pool.execute('UPDATE sessions SET expires = ? WHERE session_id = ?', [expires, sessionId])
      .then(() => callback(null)).catch(callback);
  }

  destroy(sessionId, callback = () => {}) {
    this.pool.execute('DELETE FROM sessions WHERE session_id = ?', [sessionId])
      .then(() => callback(null)).catch(callback);
  }
}
