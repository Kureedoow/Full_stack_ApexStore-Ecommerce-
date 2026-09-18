// src/models/Coupon.js

import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    discountType: {
      type: String,
      required: true,
      enum: ['percentage', 'fixed'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    minimumPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },
    maximumDiscount: {
      type: Number,
      default: null, // null = no cap
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ─── Instance method: check if coupon is valid ────────────────────────────────
couponSchema.methods.isValid = function (subtotal) {
  const now = new Date();

  if (!this.isActive) return { valid: false, reason: 'Coupon is inactive' };
  if (now < this.startDate) return { valid: false, reason: 'Coupon is not yet active' };
  if (now > this.expiryDate) return { valid: false, reason: 'Coupon has expired' };
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: 'Coupon usage limit reached' };
  }
  if (subtotal < this.minimumPurchase) {
    return {
      valid: false,
      reason: `Minimum purchase of $${this.minimumPurchase} required`,
    };
  }

  return { valid: true };
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
