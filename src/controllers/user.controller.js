// src/controllers/user.controller.js

import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { updateProfileSchema, addressSchema } from '../validators/auth.validator.js';

// ─── GET /api/users/profile ───────────────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'title slug thumbnail finalPrice rating');
  return successResponse(res, 200, 'Profile retrieved', user.toSafeObject());
});

// ─── PUT /api/users/profile ───────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const { error, value } = updateProfileSchema.validate(req.body, { abortEarly: false });
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

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: value },
    { new: true, runValidators: true }
  );

  return successResponse(res, 200, 'Profile updated successfully', user.toSafeObject());
});

// ─── GET /api/users/addresses ─────────────────────────────────────────────────
export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses');
  return successResponse(res, 200, 'Addresses retrieved', user.addresses);
});

// ─── POST /api/users/addresses ────────────────────────────────────────────────
export const addAddress = asyncHandler(async (req, res) => {
  const { error, value } = addressSchema.validate(req.body, { abortEarly: false });
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

  const user = await User.findById(req.user._id);

  // If the new address is set as default, unset any existing default
  if (value.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  // If this is the first address, make it default automatically
  if (user.addresses.length === 0) {
    value.isDefault = true;
  }

  user.addresses.push(value);
  await user.save();

  return successResponse(res, 201, 'Address added successfully', user.addresses);
});

// ─── PUT /api/users/addresses/:id ────────────────────────────────────────────
export const updateAddress = asyncHandler(async (req, res) => {
  const { error, value } = addressSchema.validate(req.body, { abortEarly: false });
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

  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.id);

  if (!address) {
    return errorResponse(res, 404, 'Address not found', 'ADDRESS_NOT_FOUND');
  }

  // If updating to default, clear other defaults
  if (value.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  Object.assign(address, value);
  await user.save();

  return successResponse(res, 200, 'Address updated successfully', user.addresses);
});

// ─── DELETE /api/users/addresses/:id ─────────────────────────────────────────
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.id);

  if (!address) {
    return errorResponse(res, 404, 'Address not found', 'ADDRESS_NOT_FOUND');
  }

  address.deleteOne();
  await user.save();

  return successResponse(res, 200, 'Address deleted successfully', user.addresses);
});
