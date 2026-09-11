// src/validators/coupon.validator.js

import Joi from 'joi';

export const createCouponSchema = Joi.object({
  code: Joi.string().uppercase().min(3).max(20).required().messages({
    'any.required': 'Coupon code is required',
  }),
  description: Joi.string().allow('').optional(),
  discountType: Joi.string().valid('percentage', 'fixed').required().messages({
    'any.required': 'Discount type is required',
    'any.only': 'Discount type must be percentage or fixed',
  }),
  discountValue: Joi.number().min(0).required().messages({
    'any.required': 'Discount value is required',
  }),
  minimumPurchase: Joi.number().min(0).optional().default(0),
  maximumDiscount: Joi.number().min(0).allow(null).optional(),
  startDate: Joi.date().optional(),
  expiryDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
    'any.required': 'Expiry date is required',
    'date.greater': 'Expiry date must be after start date',
  }),
  usageLimit: Joi.number().min(1).allow(null).optional(),
  isActive: Joi.boolean().optional(),
});

export const updateCouponSchema = Joi.object({
  description: Joi.string().allow('').optional(),
  discountType: Joi.string().valid('percentage', 'fixed').optional(),
  discountValue: Joi.number().min(0).optional(),
  minimumPurchase: Joi.number().min(0).optional(),
  maximumDiscount: Joi.number().min(0).allow(null).optional(),
  startDate: Joi.date().optional(),
  expiryDate: Joi.date().optional(),
  usageLimit: Joi.number().min(1).allow(null).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

export const validateCouponSchema = Joi.object({
  code: Joi.string().required().messages({ 'any.required': 'Coupon code is required' }),
  subtotal: Joi.number().min(0).required().messages({
    'any.required': 'Cart subtotal is required for coupon validation',
  }),
});
