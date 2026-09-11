// src/controllers/coupon.controller.js

import Coupon from '../models/Coupon.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} from '../validators/coupon.validator.js';
import { calculateCouponDiscount } from '../utils/calculatePrice.js';

// ─── GET /api/coupons (admin) ─────────────────────────────────────────────────
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return successResponse(res, 200, 'Coupons retrieved successfully', coupons);
});

// ─── POST /api/coupons (admin) ────────────────────────────────────────────────
export const createCoupon = asyncHandler(async (req, res) => {
  const { error, value } = createCouponSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message.replace(/['"]/g, ''),
        })),
      },
    });
  }

  const existing = await Coupon.findOne({ code: value.code.toUpperCase() });
  if (existing) {
    return errorResponse(res, 409, 'Coupon code already exists', 'DUPLICATE_KEY');
  }

  const coupon = await Coupon.create(value);
  return successResponse(res, 201, 'Coupon created successfully', coupon);
});

// ─── PUT /api/coupons/:id (admin) ─────────────────────────────────────────────
export const updateCoupon = asyncHandler(async (req, res) => {
  const { error, value } = updateCouponSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message.replace(/['"]/g, ''),
        })),
      },
    });
  }

  const coupon = await Coupon.findByIdAndUpdate(req.params.id, { $set: value }, { new: true });
  if (!coupon) {
    return errorResponse(res, 404, 'Coupon not found', 'COUPON_NOT_FOUND');
  }

  return successResponse(res, 200, 'Coupon updated successfully', coupon);
});

// ─── DELETE /api/coupons/:id (admin) ─────────────────────────────────────────
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    return errorResponse(res, 404, 'Coupon not found', 'COUPON_NOT_FOUND');
  }

  await coupon.deleteOne();
  return successResponse(res, 200, 'Coupon deleted successfully');
});

// ─── POST /api/coupons/validate (users) ───────────────────────────────────────
export const validateCoupon = asyncHandler(async (req, res) => {
  const { error, value } = validateCouponSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message.replace(/['"]/g, ''),
        })),
      },
    });
  }

  const { code, subtotal } = value;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) {
    return errorResponse(res, 404, 'Coupon code not found', 'COUPON_NOT_FOUND');
  }

  const { valid, reason } = coupon.isValid(subtotal);
  if (!valid) {
    return errorResponse(res, 400, reason, 'INVALID_COUPON');
  }

  const discountAmount = calculateCouponDiscount(subtotal, coupon);

  return successResponse(res, 200, 'Coupon is valid', {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    finalSubtotal: parseFloat((subtotal - discountAmount).toFixed(2)),
  });
});
