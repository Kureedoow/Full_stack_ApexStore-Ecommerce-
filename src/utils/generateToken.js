// src/utils/generateToken.js
// JWT generation and verification helpers

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Generate an access token for a user
 * @param {string} userId - MongoDB user _id
 * @param {string} role - User role ('user' | 'admin')
 * @returns {string} signed JWT
 */
export const generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
};

/**
 * Generate a refresh token for a user
 * @param {string} userId - MongoDB user _id
 * @returns {string} signed refresh JWT
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
};

/**
 * Verify an access token
 * @param {string} token - JWT string
 * @returns {object} decoded payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwt.secret);
};

/**
 * Verify a refresh token
 * @param {string} token - JWT string
 * @returns {object} decoded payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwt.refreshSecret);
};

/**
 * Cookie options for auth tokens
 */
export const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};
