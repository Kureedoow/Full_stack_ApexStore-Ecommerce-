// src/controllers/wishlist.controller.js

import User from '../models/User.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── GET /api/wishlist ────────────────────────────────────────────────────────
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'wishlist',
    'title slug thumbnail images price finalPrice rating stock availabilityStatus category brand'
  );
  return successResponse(res, 200, 'Wishlist retrieved successfully', user.wishlist || []);
});

// ─── POST /api/wishlist OR /api/wishlist/:productId ──────────────────────────
export const addToWishlist = asyncHandler(async (req, res) => {
  const productId = req.params.productId || req.body.productId;

  if (!productId) {
    return errorResponse(res, 400, 'Product ID is required', 'MISSING_PRODUCT_ID');
  }

  // Check product exists
  const product = await Product.findOne({ _id: productId, isPublished: true });
  if (!product) {
    return errorResponse(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
  }

  const user = await User.findById(req.user._id);

  // Prevent duplicates
  const alreadyInWishlist = user.wishlist.some(
    (id) => (id._id ? id._id.toString() : id.toString()) === productId.toString()
  );

  if (!alreadyInWishlist) {
    user.wishlist.push(productId);
    await user.save();
  }

  await user.populate(
    'wishlist',
    'title slug thumbnail images price finalPrice rating stock availabilityStatus category brand'
  );

  return successResponse(res, 200, 'Product added to wishlist', user.wishlist);
});

// ─── DELETE /api/wishlist/:productId ──────────────────────────────────────────
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const productId = req.params.productId || req.body.productId;

  if (!productId) {
    return errorResponse(res, 400, 'Product ID is required', 'MISSING_PRODUCT_ID');
  }

  const user = await User.findById(req.user._id);

  user.wishlist = user.wishlist.filter(
    (id) => (id._id ? id._id.toString() : id.toString()) !== productId.toString()
  );
  await user.save();

  await user.populate(
    'wishlist',
    'title slug thumbnail images price finalPrice rating stock availabilityStatus category brand'
  );

  return successResponse(res, 200, 'Product removed from wishlist', user.wishlist);
});

// ─── DELETE /api/wishlist ─────────────────────────────────────────────────────
export const clearWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.wishlist = [];
  await user.save();

  return successResponse(res, 200, 'Wishlist cleared successfully', []);
});

