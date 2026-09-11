// src/utils/asyncHandler.js
// Wraps async route handlers to avoid repetitive try/catch blocks

/**
 * Wraps an async Express route handler and forwards errors to next()
 * @param {Function} fn - async controller function
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
