// src/routes/admin.routes.js

import { Router } from 'express';
import {
  getDashboard,
  getSalesStatistics,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  getAdminProducts,
} from '../controllers/admin.controller.js';
import protect from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/role.middleware.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard', getDashboard);
router.get('/statistics', getSalesStatistics);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id', updateUser);
router.patch('/users/:id/status', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', changeUserRole);

// Order management
router.get('/orders', getAllOrders);
router.get('/orders/:id', getAdminOrderById);
router.patch('/orders/:id/status', updateOrderStatus);

// Product management (admin view with all products)
router.get('/products', getAdminProducts);

export default router;
