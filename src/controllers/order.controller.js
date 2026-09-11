// src/controllers/order.controller.js

import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { successResponse, errorResponse, buildPagination } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createOrderSchema } from '../validators/order.validator.js';
import {
  calculateCouponDiscount,
  calculateShippingFee,
  calculateTax,
  calculateOrderTotal,
} from '../utils/calculatePrice.js';
import { processPayment } from '../services/payment.service.js';
import { sendOrderConfirmation } from '../services/email.service.js';

// ─── POST /api/orders (checkout) ─────────────────────────────────────────────
export const createOrder = asyncHandler(async (req, res) => {
  const { error, value } = createOrderSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errorDetails = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));
    return res.status(422).json({
      success: false,
      message: errorDetails[0]?.message || 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details: errorDetails,
      },
    });
  }

  const { shippingAddress, paymentMethod = 'card', couponCode, notes = '' } = value;

  // Ensure shipping address has required fallback fields
  const cleanAddress = {
    fullName: shippingAddress.fullName?.trim() || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Customer',
    phone: shippingAddress.phone?.trim() || req.user.phone || 'N/A',
    addressLine1: shippingAddress.addressLine1?.trim() || '',
    addressLine2: shippingAddress.addressLine2?.trim() || '',
    city: shippingAddress.city?.trim() || '',
    state: shippingAddress.state?.trim() || '',
    postalCode: shippingAddress.postalCode?.trim() || '',
    country: shippingAddress.country?.trim() || 'United States',
  };

  // 1. Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  const validCartItems = (cart?.items || []).filter((item) => item && item.product);

  if (!cart || validCartItems.length === 0) {
    return errorResponse(res, 400, 'Your cart is empty', 'CART_EMPTY');
  }

  // 2. Verify all products exist and have sufficient stock
  const orderItems = [];
  for (const item of validCartItems) {
    const product = item.product._id ? item.product : await Product.findById(item.product);
    if (!product || !product.isPublished) {
      return errorResponse(
        res,
        400,
        `Product "${item.product?.title || 'An item'}" is no longer available`,
        'PRODUCT_UNAVAILABLE'
      );
    }
    if (product.stock < item.quantity) {
      return errorResponse(
        res,
        400,
        `Insufficient stock for "${product.title}". Available: ${product.stock}`,
        'INSUFFICIENT_STOCK'
      );
    }

    const priceAtOrder = product.finalPrice ?? product.price ?? 0;

    // Snapshot price at order time — always from DB
    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.thumbnail || (product.images && product.images[0]) || '',
      quantity: item.quantity,
      price: priceAtOrder,
      subtotal: parseFloat((priceAtOrder * item.quantity).toFixed(2)),
    });
  }

  // 3. Calculate subtotal from DB prices (never trust cart totals blindly)
  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  // 4. Apply coupon if provided
  let discount = 0;
  let appliedCoupon = { code: null, discountAmount: 0 };

  if (couponCode && couponCode.trim()) {
    const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });
    if (!coupon) {
      return errorResponse(res, 404, 'Coupon code not found', 'COUPON_NOT_FOUND');
    }

    const { valid, reason } = coupon.isValid(subtotal);
    if (!valid) {
      return errorResponse(res, 400, reason, 'INVALID_COUPON');
    }

    discount = calculateCouponDiscount(subtotal, coupon);
    appliedCoupon = { code: coupon.code, discountAmount: discount };

    // Increment usage count
    coupon.usedCount += 1;
    await coupon.save();
  }

  // 5. Calculate shipping, tax, total
  const discountedSubtotal = subtotal - discount;
  const shippingFee = calculateShippingFee(discountedSubtotal);
  const tax = calculateTax(discountedSubtotal);
  const totalPrice = calculateOrderTotal(subtotal, discount, shippingFee, tax);

  // 6. Process payment (mock for now)
  const paymentResult = await processPayment({
    method: paymentMethod,
    amount: totalPrice,
    orderId: `ORD_${Date.now()}`,
  });

  // 7. Create the order
  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress: cleanAddress,
    paymentMethod,
    paymentStatus: paymentResult.status === 'paid' ? 'paid' : 'pending',
    orderStatus: 'pending',
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount,
    shippingFee,
    tax,
    totalPrice,
    coupon: appliedCoupon,
    notes: notes || '',
    statusHistory: [
      { status: 'pending', updatedBy: req.user._id, note: 'Order created' },
    ],
  });

  // 8. Decrease product stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  // 9. Clear cart
  cart.items = [];
  cart.subtotal = 0;
  cart.totalItems = 0;
  cart.shippingFee = 0;
  cart.discount = 0;
  cart.totalPrice = 0;
  await cart.save();

  // 10. Send confirmation email (non-blocking)
  sendOrderConfirmation(req.user, order).catch(() => {});

  await order.populate('orderItems.product', 'title slug thumbnail');

  return successResponse(res, 201, 'Order placed successfully', order);
});

// ─── GET /api/orders ──────────────────────────────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const [orders, totalItems] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-statusHistory'),
    Order.countDocuments({ user: req.user._id }),
  ]);

  return successResponse(
    res,
    200,
    'Orders retrieved successfully',
    orders,
    buildPagination(page, limit, totalItems)
  );
});

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
export const getOrderById = asyncHandler(async (req, res) => {
  const query = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, user: req.user._id };

  const order = await Order.findOne(query)
    .populate('orderItems.product', 'title slug thumbnail images price finalPrice')
    .populate('user', 'firstName lastName email username phone');

  if (!order) {
    return errorResponse(res, 404, 'Order not found', 'ORDER_NOT_FOUND');
  }

  return successResponse(res, 200, 'Order retrieved successfully', order);
});

// ─── PATCH /api/orders/:id/cancel ────────────────────────────────────────────
export const cancelOrder = asyncHandler(async (req, res) => {
  const query = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, user: req.user._id };

  const order = await Order.findOne(query);

  if (!order) {
    return errorResponse(res, 404, 'Order not found', 'ORDER_NOT_FOUND');
  }

  // Only pending or confirmed orders can be cancelled by user (unless admin)
  if (req.user.role !== 'admin' && !['pending', 'confirmed'].includes(order.orderStatus)) {
    return errorResponse(
      res,
      400,
      `Cannot cancel order in "${order.orderStatus}" status`,
      'CANCEL_NOT_ALLOWED'
    );
  }

  // Restore stock
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
  }

  order.orderStatus = 'cancelled';
  order.paymentStatus = order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus;
  order.statusHistory.push({
    status: 'cancelled',
    updatedBy: req.user._id,
    note: 'Cancelled by customer',
  });

  await order.save();

  return successResponse(res, 200, 'Order cancelled successfully', order);
});
