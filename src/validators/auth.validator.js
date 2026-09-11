// src/validators/auth.validator.js
// Joi validation schemas for authentication endpoints

import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_.-]+$/)
    .optional()
    .allow('', null)
    .messages({
      'string.pattern.base': 'Username may only contain letters, numbers, dots, underscores, or hyphens',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 30 characters',
    }),
  firstName: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'First name is required',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().trim().max(50).optional().allow('', null).messages({
    'string.max': 'Last name cannot exceed 50 characters',
  }),
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).optional().allow('', null).messages({
    'any.only': 'Passwords do not match',
  }),
  phone: Joi.string().trim().allow('', null).optional(),
}).options({ stripUnknown: true });

export const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
}).options({ stripUnknown: true });

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string().min(6).max(100).required().messages({
    'string.min': 'New password must be at least 6 characters',
    'any.required': 'New password is required',
  }),
  confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'New passwords do not match',
    'any.required': 'Please confirm the new password',
  }),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
  phone: Joi.string().allow('').optional(),
  avatar: Joi.string().allow('').optional(),
});

export const addressSchema = Joi.object({
  fullName: Joi.string().required().messages({ 'any.required': 'Full name is required' }),
  phone: Joi.string().required().messages({ 'any.required': 'Phone is required' }),
  addressLine1: Joi.string().required().messages({ 'any.required': 'Address line 1 is required' }),
  addressLine2: Joi.string().allow('').optional(),
  city: Joi.string().required().messages({ 'any.required': 'City is required' }),
  state: Joi.string().required().messages({ 'any.required': 'State is required' }),
  postalCode: Joi.string().required().messages({ 'any.required': 'Postal code is required' }),
  country: Joi.string().required().messages({ 'any.required': 'Country is required' }),
  isDefault: Joi.boolean().optional(),
});
