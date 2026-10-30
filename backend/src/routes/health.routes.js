import { Router } from 'express';
import { pool } from '../database/pool.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

export default router;
