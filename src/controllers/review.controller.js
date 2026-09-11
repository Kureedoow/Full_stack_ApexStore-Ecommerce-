// src/controllers/review.controller.js

import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse, buildPagination } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createReviewSchema, updateReviewSchema } from '../validators/product.validator.js';

// ─── GET /api/products/:productId/reviews ────────────────────────────────────
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const product = await Product.findById(productId);
  if (!product) {
    return errorResponse(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
  }

  const [reviews, totalItems] = await Promise.all([
    Review.find({ product: productId, isApproved: true })
      .populate('user', 'firstName lastName avatar username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ product: productId, isApproved: true }),
  ]);

  return successResponse(
    res,
    200,
    'Reviews retrieved successfully',
    reviews,
    buildPagination(page, limit, totalItems)
  );
});

// ─── POST /api/products/:productId/reviews ────────────────────────────────────
export const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const { error, value } = createReviewSchema.validate(req.body, { abortEarly: false });
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

  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    return errorResponse(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
  }

  // Check user has purchased the product (order must be delivered)
  const purchasedOrder = await Order.findOne({
    user: req.user._id,
    orderStatus: 'delivered',
    'orderItems.product': productId,
  });

  if (!purchasedOrder) {
    return errorResponse(
      res,
      403,
      'You can only review products you have purchased and received',
      'REVIEW_NOT_ALLOWED'
    );
  }

  // Check if review already exists
  const existingReview = await Review.findOne({ user: req.user._id, product: productId });
  if (existingReview) {
    return errorResponse(
      res,
      409,
      'You have already reviewed this product. Update your existing review instead.',
      'REVIEW_ALREADY_EXISTS'
    );
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    ...value,
  });

  await review.populate('user', 'firstName lastName avatar username');

  return successResponse(res, 201, 'Review submitted successfully', review);
});

// ─── PUT /api/reviews/:id ─────────────────────────────────────────────────────
export const updateReview = asyncHandler(async (req, res) => {
  const { error, value } = updateReviewSchema.validate(req.body, { abortEarly: false });
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

  const review = await Review.findById(req.params.id);
  if (!review) {
    return errorResponse(res, 404, 'Review not found', 'REVIEW_NOT_FOUND');
  }

  // Only review author can update (unless admin)
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Not authorized to update this review', 'FORBIDDEN');
  }

  Object.assign(review, value);
  await review.save();
  await Review.recalculateRating(review.product);

  await review.populate('user', 'firstName lastName avatar username');

  return successResponse(res, 200, 'Review updated successfully', review);
});

// ─── DELETE /api/reviews/:id ──────────────────────────────────────────────────
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return errorResponse(res, 404, 'Review not found', 'REVIEW_NOT_FOUND');
  }

  // Author or admin can delete
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Not authorized to delete this review', 'FORBIDDEN');
  }

  const productId = review.product;
  await review.deleteOne();
  await Review.recalculateRating(productId);

  return successResponse(res, 200, 'Review deleted successfully');
});
