// src/middleware/role.middleware.js
// Role-based authorization middleware

import { errorResponse } from '../utils/apiResponse.js';

/**
 * Restrict access to specified roles
 * Usage: requireRole('admin')  or  requireRole('admin', 'moderator')
 * Must be used AFTER the protect middleware
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required.', 'UNAUTHORIZED');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access forbidden. Required role: ${roles.join(' or ')}`,
        'FORBIDDEN'
      );
    }

    next();
  };
};

/**
 * Shorthand — admin-only
 */
export const adminOnly = requireRole('admin');
