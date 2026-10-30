import { Router } from 'express';
import { getCurrentUser, login, logout, register } from '../controllers/auth.controller.js';
import { authRateLimit } from '../middleware/auth-rate-limit.js';

const router = Router();

router.get('/me', getCurrentUser);
router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);
router.post('/logout', logout);

export default router;
