import { env } from '../config/env.js';

export function requireAllowedOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const origin = req.get('origin');
  if (!origin || !env.frontendOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Request origin is not allowed.' });
  }
  return next();
}
