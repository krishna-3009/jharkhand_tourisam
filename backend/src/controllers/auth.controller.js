import bcrypt from 'bcryptjs';
import { pool } from '../database/pool.js';
import { env } from '../config/env.js';

const publicUser = ({ id, name, email }) => ({ id, name, email });

const regenerateSession = (req) => new Promise((resolve, reject) => {
  req.session.regenerate((error) => error ? reject(error) : resolve());
});

const saveSession = (req) => new Promise((resolve, reject) => {
  req.session.save((error) => error ? reject(error) : resolve());
});

const destroySession = (req) => new Promise((resolve, reject) => {
  req.session.destroy((error) => error ? reject(error) : resolve());
});

const isValidEmail = (email) => typeof email === 'string'
  && email.length <= 254
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function getCurrentUser(req, res, next) {
  try {
    if (!req.session.userId) return res.json({ user: null });

    const [rows] = await pool.execute(
      'SELECT id, name, email FROM users WHERE id = ?',
      [req.session.userId],
    );
    if (!rows[0]) {
      await destroySession(req);
      res.clearCookie('jh.sid', {
        httpOnly: true,
        secure: env.cookieSecure,
        sameSite: env.cookieSameSite,
        path: '/',
      });
      return res.json({ user: null });
    }
    return res.json({ user: publicUser(rows[0]) });
  } catch (error) {
    return next(error);
  }
}

export async function register(req, res, next) {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({ error: 'Name must be between 2 and 80 characters.' });
    }
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must contain at least 8 characters.' });
    if (Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ error: 'Password must be no longer than 72 bytes.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash],
    );
    const user = { id: result.insertId, name, email };

    await regenerateSession(req);
    req.session.userId = user.id;
    await saveSession(req);
    return res.status(201).json({ user });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'An account with that email already exists. Try logging in instead.' });
    }
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!isValidEmail(email) || !password || Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }

    const [rows] = await pool.execute(
      'SELECT id, name, email, password_hash FROM users WHERE email = ?',
      [email],
    );
    const row = rows[0];
    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }

    await regenerateSession(req);
    req.session.userId = row.id;
    if (req.body.remember === true) req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    await saveSession(req);
    return res.json({ user: publicUser(row) });
  } catch (error) {
    return next(error);
  }
}

export async function logout(req, res, next) {
  try {
    if (req.session) await destroySession(req);
    res.clearCookie('jh.sid', {
      httpOnly: true,
      secure: env.cookieSecure,
      sameSite: env.cookieSameSite,
      path: '/',
    });
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
}
