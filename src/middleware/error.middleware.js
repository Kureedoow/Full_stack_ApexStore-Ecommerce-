// src/middleware/error.middleware.js
// Centralized error handling middleware

import { env } from '../config/env.js';

/**
 * Custom API error class for predictable error shaping
 */
export class ApiError extends Error {
  constructor(statusCode, message, errorCode = 'ERROR', errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler — must be registered LAST in Express middleware chain
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errorCode = err.errorCode || 'INTERNAL_ERROR';
  let errors = err.errors || null;

  // ── Mongoose validation error ─────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 422;
    errorCode = 'VALIDATION_ERROR';
    const firstErr = Object.values(err.errors)[0];
    message = firstErr?.message || 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ── Mongoose duplicate key error ──────────────────────────────────────────
  else if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // ── Mongoose cast error (invalid ObjectId) ────────────────────────────────
  else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ── JWT errors ─────────────────────────────────────────────────────────────
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Token has expired';
  }

  // ── Joi validation errors ─────────────────────────────────────────────────
  else if (err.isJoi) {
    statusCode = 422;
    errorCode = 'VALIDATION_ERROR';
    message = err.details?.[0]?.message?.replace(/['"]/g, '') || 'Validation failed';
    errors = err.details?.map((d) => ({
      field: d.path?.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));
  }

  // Log unexpected (non-operational) errors
  if (!err.isOperational) {
    console.error('🔴 Unexpected Error:', err);
  }

  const response = {
    success: false,
    message,
    error: { code: errorCode },
  };

  if (errors) response.error.details = errors;

  // Only expose stack trace in development
  if (env.isDevelopment && !err.isOperational) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

/**
 * 404 handler — catches unmatched routes
 */
export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: { code: 'ROUTE_NOT_FOUND' },
  });
};
