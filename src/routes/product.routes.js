// src/routes/product.routes.js
// IMPORTANT: /slug/:slug must be declared BEFORE /:id to avoid route conflicts

import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import protect from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/role.middleware.js';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.patch('/:id', protect, adminOnly, patchProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
