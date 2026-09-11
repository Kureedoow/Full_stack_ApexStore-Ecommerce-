// src/routes/wishlist.routes.js

import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../controllers/wishlist.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.post('/:productId', addToWishlist);
router.delete('/', clearWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;

