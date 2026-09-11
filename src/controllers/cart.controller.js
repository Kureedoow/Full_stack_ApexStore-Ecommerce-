// src/controllers/cart.controller.js

import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  calculateItemSubtotal,
  calculateCartTotals,
  calculateShippingFee,
} from '../utils/calculatePrice.js';

// ─── Helper: recalculate and save cart totals ─────────────────────────────────
const recalculateCart = (cart) => {
  const { subtotal, totalItems } = calculateCartTotals(cart.items);
  cart.subtotal = subtotal;
  cart.totalItems = totalItems;
  cart.shippingFee = calculateShippingFee(subtotal);
  cart.totalPrice = parseFloat((subtotal + cart.shippingFee - (cart.discount || 0)).toFixed(2));
};

// ─── GET /api/cart ────────────────────────────────────────────────────────────
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'title slug thumbnail finalPrice stock availabilityStatus'
  );

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  return successResponse(res, 200, 'Cart retrieved successfully', cart);
});

// ─── POST /api/cart/items ─────────────────────────────────────────────────────
export const addCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return errorResponse(res, 400, 'Product ID is required', 'MISSING_PRODUCT_ID');
  }

  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < 1) {
    return errorResponse(res, 400, 'Quantity must be at least 1', 'INVALID_QUANTITY');
  }

  // Always get price from DB — never trust frontend
  const product = await Product.findOne({ _id: productId, isPublished: true });
  if (!product) {
    return errorResponse(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
  }

  if (product.stock <= 0) {
    return errorResponse(res, 400, 'Product is out of stock', 'OUT_OF_STOCK');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    const newQty = existingItem.quantity + qty;
    if (newQty > product.stock) {
      return errorResponse(
        res,
        400,
        `Only ${product.stock} units available in stock`,
        'INSUFFICIENT_STOCK'
      );
    }
    existingItem.quantity = newQty;
    existingItem.price = product.finalPrice;
    existingItem.subtotal = calculateItemSubtotal(product.finalPrice, newQty);
  } else {
    if (qty > product.stock) {
      return errorResponse(
        res,
        400,
        `Only ${product.stock} units available in stock`,
        'INSUFFICIENT_STOCK'
      );
    }
    cart.items.push({
      product: product._id,
      quantity: qty,
      price: product.finalPrice,
      subtotal: calculateItemSubtotal(product.finalPrice, qty),
    });
  }

  recalculateCart(cart);
  await cart.save();

  await cart.populate('items.product', 'title slug thumbnail finalPrice stock availabilityStatus');

  return successResponse(res, 200, 'Item added to cart', cart);
});

// ─── PUT /api/cart/items/:productId ───────────────────────────────────────────
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const qty = parseInt(quantity, 10);

  if (isNaN(qty) || qty < 1) {
    return errorResponse(res, 400, 'Quantity must be at least 1', 'INVALID_QUANTITY');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return errorResponse(res, 404, 'Cart not found', 'CART_NOT_FOUND');
  }

  const targetId = req.params.productId;

  // Match either by product ObjectId OR by cart item subdocument _id
  const item = cart.items.find(
    (i) =>
      (i.product && i.product.toString() === targetId) ||
      (i._id && i._id.toString() === targetId)
  );

  if (!item) {
    return errorResponse(res, 404, 'Item not found in cart', 'ITEM_NOT_FOUND');
  }

  // Check stock
  const product = await Product.findById(item.product);
  if (!product) {
    return errorResponse(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
  }

  if (qty > product.stock) {
    return errorResponse(
      res,
      400,
      `Only ${product.stock} units available in stock`,
      'INSUFFICIENT_STOCK'
    );
  }

  const itemPrice = product.finalPrice ?? product.price ?? item.price;
  item.quantity = qty;
  item.price = itemPrice;
  item.subtotal = calculateItemSubtotal(itemPrice, qty);

  recalculateCart(cart);
  await cart.save();

  await cart.populate('items.product', 'title slug thumbnail finalPrice price stock availabilityStatus');

  return successResponse(res, 200, 'Cart item updated', cart);
});

// ─── DELETE /api/cart/items/:productId ────────────────────────────────────────
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return errorResponse(res, 404, 'Cart not found', 'CART_NOT_FOUND');
  }

  const targetId = req.params.productId;

  // Match either by product ObjectId OR by cart item subdocument _id
  const index = cart.items.findIndex(
    (i) =>
      (i.product && i.product.toString() === targetId) ||
      (i._id && i._id.toString() === targetId)
  );

  if (index === -1) {
    return errorResponse(res, 404, 'Item not found in cart', 'ITEM_NOT_FOUND');
  }

  cart.items.splice(index, 1);
  recalculateCart(cart);
  await cart.save();

  await cart.populate('items.product', 'title slug thumbnail finalPrice price stock availabilityStatus');

  return successResponse(res, 200, 'Item removed from cart', cart);
});

// ─── DELETE /api/cart ─────────────────────────────────────────────────────────
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return errorResponse(res, 404, 'Cart not found', 'CART_NOT_FOUND');
  }

  cart.items = [];
  recalculateCart(cart);
  await cart.save();

  return successResponse(res, 200, 'Cart cleared successfully', cart);
});
