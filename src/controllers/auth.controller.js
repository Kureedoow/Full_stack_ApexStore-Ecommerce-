// src/controllers/auth.controller.js

import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  cookieOptions,
  refreshCookieOptions,
} from '../utils/generateToken.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from '../validators/auth.validator.js';

// ─── POST /api/auth/register ──────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const firstErrorMessage = error.details[0]?.message?.replace(/['"]/g, '') || 'Validation failed';
    return res.status(422).json({
      success: false,
      message: firstErrorMessage,
      error: {
        code: 'VALIDATION_ERROR',
        message: firstErrorMessage,
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message.replace(/['"]/g, ''),
        })),
      },
    });
  }

  let { username, firstName, lastName, email, password, phone } = value;
  email = email.toLowerCase().trim();
  firstName = firstName.trim();
  lastName = (lastName || '').trim() || firstName;

  // Auto-generate username if not provided or empty
  if (!username || !username.trim()) {
    const base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user';
    const rand = Math.floor(Math.random() * 10000);
    username = `${base.slice(0, 20)}_${rand}`;
  } else {
    username = username.trim().toLowerCase();
  }

  // Check duplicates
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return errorResponse(res, 409, 'An account with this email already exists', 'DUPLICATE_EMAIL');
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    username = `${username}_${Math.floor(Math.random() * 1000)}`;
  }

  const user = await User.create({ username, firstName, lastName, email, password, phone });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set cookies
  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  return successResponse(res, 201, 'Registration successful', {
    user: user.toSafeObject(),
    accessToken,
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const firstErrorMessage = error.details[0]?.message?.replace(/['"]/g, '') || 'Validation failed';
    return res.status(422).json({
      success: false,
      message: firstErrorMessage,
      error: {
        code: 'VALIDATION_ERROR',
        message: firstErrorMessage,
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message.replace(/['"]/g, ''),
        })),
      },
    });
  }

  const { email, password } = value;
  const normalizedEmail = (email || '').toLowerCase().trim();

  // Must use +password to include it (select: false on schema)
  const user = await User.findOne({ email: normalizedEmail }).select('+password +refreshToken');
  if (!user) {
    return errorResponse(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    return errorResponse(res, 403, 'Your account has been deactivated', 'ACCOUNT_INACTIVE');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return errorResponse(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  return successResponse(res, 200, 'Login successful', {
    user: user.toSafeObject(),
    accessToken,
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token from DB
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return successResponse(res, 200, 'Logged out successfully');
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'title slug thumbnail finalPrice');
  return successResponse(res, 200, 'User retrieved successfully', user.toSafeObject());
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    return errorResponse(res, 401, 'No refresh token provided', 'UNAUTHORIZED');
  }

  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    return errorResponse(res, 401, 'Invalid refresh token', 'INVALID_TOKEN');
  }

  const newAccessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('accessToken', newAccessToken, cookieOptions);
  res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);

  return successResponse(res, 200, 'Token refreshed', { accessToken: newAccessToken });
});

// ─── PATCH /api/auth/change-password ─────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { error, value } = changePasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const firstErrorMessage = error.details[0]?.message?.replace(/['"]/g, '') || 'Validation failed';
    return res.status(422).json({
      success: false,
      message: firstErrorMessage,
      error: {
        code: 'VALIDATION_ERROR',
        message: firstErrorMessage,
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message.replace(/['"]/g, ''),
        })),
      },
    });
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(value.currentPassword);
  if (!isMatch) {
    return errorResponse(res, 400, 'Current password is incorrect', 'WRONG_PASSWORD');
  }

  user.password = value.newPassword;
  await user.save();

  // Invalidate tokens
  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return successResponse(res, 200, 'Password changed successfully. Please log in again.');
});
