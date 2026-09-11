// src/routes/review.routes.js

import { Router } from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/review.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = Router({ mergeParams: true }); // mergeParams lets us access :productId from parent route

// GET /api/products/:productId/reviews — public
router.get('/', getProductReviews);

// POST /api/products/:productId/reviews — authenticated
router.post('/', protect, createReview);

export default router;

// Separate router for review-level operations (mounted at /api/reviews)
export const reviewRouter = Router();
reviewRouter.put('/:id', protect, updateReview);
reviewRouter.delete('/:id', protect, deleteReview);
