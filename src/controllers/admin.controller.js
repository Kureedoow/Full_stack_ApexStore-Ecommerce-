// src/controllers/admin.controller.js

import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { successResponse, errorResponse, buildPagination } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { updateOrderStatusSchema } from '../validators/order.validator.js';
import { sendOrderStatusUpdate } from '../services/email.service.js';

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    revenueData,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    lowStockProducts,
    recentOrders,
    recentUsers,
    topSellingProducts,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isPublished: true }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.countDocuments({ orderStatus: 'pending' }),
    Order.countDocuments({ orderStatus: 'delivered' }),
    Order.countDocuments({ orderStatus: 'cancelled' }),
    Product.find({ stock: { $gt: 0, $lte: 10 } })
      .select('title stock thumbnail')
      .limit(10),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'firstName lastName email')
      .select('orderStatus totalPrice paymentStatus createdAt'),
    User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt'),
    Product.find()
      .sort({ soldCount: -1 })
      .limit(10)
      .select('title thumbnail soldCount finalPrice rating'),
  ]);

  const totalRevenue = revenueData[0]?.total || 0;

  return successResponse(res, 200, 'Dashboard data retrieved', {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    pendingOrders,
    completedOrders,
    cancelledOrders,
    lowStockProducts,
    topSellingProducts,
    recentOrders,
    recentUsers,
  });
});

// ─── GET /api/admin/statistics ────────────────────────────────────────────────
export const getSalesStatistics = asyncHandler(async (req, res) => {
  const { period = 'monthly' } = req.query;

  let groupBy;
  let dateRange;

  const now = new Date();

  if (period === 'daily') {
    // Last 30 days
    dateRange = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    groupBy = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
      day: { $dayOfMonth: '$createdAt' },
    };
  } else if (period === 'weekly') {
    // Last 12 weeks
    dateRange = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
    groupBy = {
      year: { $year: '$createdAt' },
      week: { $week: '$createdAt' },
    };
  } else if (period === 'yearly') {
    // Last 5 years
    dateRange = new Date(now.getFullYear() - 5, 0, 1);
    groupBy = { year: { $year: '$createdAt' } };
  } else {
    // Monthly — last 12 months (default)
    dateRange = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    groupBy = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
    };
  }

  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange },
        orderStatus: { $ne: 'cancelled' },
      },
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
  ]);

  return successResponse(res, 200, 'Sales statistics retrieved', { period, salesData });
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;
  const { search, role } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) filter.role = role;

  const [users, totalItems] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password -refreshToken -wishlist -addresses'),
    User.countDocuments(filter),
  ]);

  return successResponse(
    res,
    200,
    'Users retrieved successfully',
    users,
    buildPagination(page, limit, totalItems)
  );
});

// ─── GET /api/admin/users/:id ─────────────────────────────────────────────────
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken');
  if (!user) {
    return errorResponse(res, 404, 'User not found', 'USER_NOT_FOUND');
  }
  return successResponse(res, 200, 'User retrieved successfully', user);
});

// ─── PATCH /api/admin/users/:id ───────────────────────────────────────────────
export const updateUser = asyncHandler(async (req, res) => {
  const { isActive, role } = req.body;

  // Prevent admin from demoting themselves
  if (req.params.id === req.user._id.toString() && role) {
    return errorResponse(res, 400, 'You cannot change your own role', 'SELF_ROLE_CHANGE');
  }

  const updates = {};
  if (typeof isActive === 'boolean') updates.isActive = isActive;
  if (role && ['user', 'admin'].includes(role)) updates.role = role;

  const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true }).select(
    '-password -refreshToken'
  );

  if (!user) {
    return errorResponse(res, 404, 'User not found', 'USER_NOT_FOUND');
  }

  return successResponse(res, 200, 'User updated successfully', user);
});

// ─── DELETE /api/admin/users/:id ─────────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return errorResponse(res, 400, 'You cannot delete your own account', 'SELF_DELETE');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return errorResponse(res, 404, 'User not found', 'USER_NOT_FOUND');
  }

  await user.deleteOne();
  return successResponse(res, 200, 'User deleted successfully');
});

// ─── PATCH /api/admin/users/:id/role ─────────────────────────────────────────
export const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return errorResponse(res, 400, 'Invalid role. Must be user or admin', 'INVALID_ROLE');
  }

  if (req.params.id === req.user._id.toString()) {
    return errorResponse(res, 400, 'You cannot change your own role', 'SELF_ROLE_CHANGE');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { role } },
    { new: true }
  ).select('-password -refreshToken');

  if (!user) {
    return errorResponse(res, 404, 'User not found', 'USER_NOT_FOUND');
  }

  return successResponse(res, 200, `User role updated to ${role}`, user);
});

// ─── GET /api/admin/orders ────────────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;
  const { status, orderStatus, paymentStatus, search } = req.query;

  const filter = {};
  const targetStatus = orderStatus || status;
  if (targetStatus) filter.orderStatus = targetStatus;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  if (search && search.trim()) {
    const q = search.trim();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(q);

    if (isObjectId) {
      filter.$or = [{ _id: q }];
    } else {
      const matchingUsers = await User.find({
        $or: [
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { username: { $regex: q, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        ...(userIds.length > 0 ? [{ user: { $in: userIds } }] : []),
        { 'shippingAddress.fullName': { $regex: q, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: q, $options: 'i' } },
        { 'shippingAddress.city': { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } },
      ];
    }
  }

  const [orders, totalItems] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email')
      .select('-statusHistory'),
    Order.countDocuments(filter),
  ]);

  return successResponse(
    res,
    200,
    'Orders retrieved successfully',
    orders,
    buildPagination(page, limit, totalItems)
  );
});

// ─── GET /api/admin/orders/:id ────────────────────────────────────────────────
export const getAdminOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'firstName lastName email phone')
    .populate('orderItems.product', 'title slug thumbnail');

  if (!order) {
    return errorResponse(res, 404, 'Order not found', 'ORDER_NOT_FOUND');
  }

  return successResponse(res, 200, 'Order retrieved successfully', order);
});

// ─── PATCH /api/admin/orders/:id/status ──────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { error, value } = updateOrderStatusSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(422).json({
      success: false,
      message: error.details[0]?.message?.replace(/['"]/g, '') || 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message.replace(/['"]/g, ''),
        })),
      },
    });
  }

  const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
  if (!order) {
    return errorResponse(res, 404, 'Order not found', 'ORDER_NOT_FOUND');
  }

  const previousStatus = order.orderStatus;
  const newStatus = value.orderStatus;

  // If newly cancelled, restore product stock
  if (newStatus === 'cancelled' && previousStatus !== 'cancelled') {
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, soldCount: -item.quantity },
      });
    }
  }

  // If uncancelled, deduct stock again
  if (previousStatus === 'cancelled' && newStatus !== 'cancelled') {
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      });
    }
  }

  order.orderStatus = newStatus;
  if (value.paymentStatus) order.paymentStatus = value.paymentStatus;

  order.statusHistory.push({
    status: newStatus,
    updatedBy: req.user._id,
    note: value.note || `Status updated to ${newStatus} by admin`,
  });

  await order.save();

  // Notify user
  sendOrderStatusUpdate(order.user, order).catch(() => {});

  return successResponse(res, 200, 'Order status updated successfully', order);
});

// ─── GET /api/admin/products ──────────────────────────────────────────────────
export const getAdminProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;
  const { search, category, isPublished } = req.query;

  const filter = {};
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category.toLowerCase();
  if (isPublished !== undefined) filter.isPublished = isPublished === 'true';

  const [products, totalItems] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v'),
    Product.countDocuments(filter),
  ]);

  return successResponse(
    res,
    200,
    'Products retrieved successfully',
    products,
    buildPagination(page, limit, totalItems)
  );
});
