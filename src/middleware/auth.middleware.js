// src/middleware/auth.middleware.js
// Verifies JWT from Authorization header or HTTP-only cookie

import { verifyAccessToken } from '../utils/generateToken.js';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Protect routes — requires a valid JWT
 * Reads token from: Authorization: Bearer <token>  OR  cookie: accessToken
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fall back to HTTP-only cookie
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return errorResponse(res, 401, 'Access denied. No token provided.', 'UNAUTHORIZED');
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Fetch user (exclude password)
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user) {
      return errorResponse(res, 401, 'User no longer exists.', 'UNAUTHORIZED');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been deactivated.', 'ACCOUNT_INACTIVE');
    }

    // Attach to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token has expired. Please log in again.', 'TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Invalid token.', 'INVALID_TOKEN');
    }
    return errorResponse(res, 500, 'Authentication failed.', 'AUTH_ERROR');
  }
};

export default protect;
