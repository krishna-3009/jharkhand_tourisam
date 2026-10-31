import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import healthRoutes from './routes/health.routes.js';
import { requireAllowedOrigin } from './middleware/request-origin.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp(sessionStore) {
  const app = express();
  if (env.isProduction) app.set('trust proxy', 1);

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || env.frontendOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('This website is not allowed to use the authentication API.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }));
  app.use(express.json({ limit: '10kb' }));
  app.use((req, _res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) req.body = {};
    next();
  });
  app.use('/api', requireAllowedOrigin);
  app.use(session({
    name: 'jh.sid',
    secret: env.sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: env.isProduction,
    cookie: {
      httpOnly: true,
      secure: env.cookieSecure,
      sameSite: env.cookieSameSite,
      maxAge: env.sessionCookieMaxAgeMs,
      path: '/',
    },
  }));

  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use((_req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
  app.use(errorHandler);
  return app;
}
