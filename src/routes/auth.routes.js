// src/routes/auth.routes.js

import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  changePassword,
} from '../controllers/auth.controller.js';
import protect from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/refresh', refreshToken);
router.patch('/change-password', protect, changePassword);

export default router;
