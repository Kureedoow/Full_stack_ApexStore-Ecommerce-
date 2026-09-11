// src/middleware/rateLimit.middleware.js
// Rate limiting configurations for different route groups

import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * General API rate limit — relaxed for development and smooth SPA navigation
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.isDevelopment ? 10000 : 1000,
  skip: () => env.isDevelopment,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    error: { code: 'RATE_LIMIT_EXCEEDED' },
  },
});

/**
 * Auth rate limit — relaxed for smooth login/registration testing
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isDevelopment ? 500 : 50,
  skip: () => env.isDevelopment,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    error: { code: 'AUTH_RATE_LIMIT_EXCEEDED' },
  },
});

/**
 * Strict limiter — for sensitive endpoints
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.isDevelopment ? 100 : 10,
  skip: () => env.isDevelopment,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests for this action. Please try again in an hour.',
    error: { code: 'STRICT_RATE_LIMIT_EXCEEDED' },
  },
});

