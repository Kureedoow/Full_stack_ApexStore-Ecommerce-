// src/models/Product.js

import mongoose from 'mongoose';
import { calculateFinalPrice } from '../utils/calculatePrice.js';

const dimensionsSchema = new mongoose.Schema(
  {
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    depth: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    finalPrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    sku: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
      trim: true,
      uppercase: true,
    },
    images: {
      type: [String],
      default: [],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    availabilityStatus: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock',
    },
    minimumOrderQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    weight: {
      type: Number,
      default: 0,
    },
    dimensions: {
      type: dimensionsSchema,
      default: () => ({}),
    },
    warrantyInformation: {
      type: String,
      default: 'No warranty',
    },
    shippingInformation: {
      type: String,
      default: 'Ships in 3–5 business days',
    },
    returnPolicy: {
      type: String,
      default: '30-day return policy',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    soldCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });

// ─── Pre-save: calculate finalPrice and availabilityStatus ───────────────────
productSchema.pre('save', function (next) {
  this.finalPrice = calculateFinalPrice(this.price, this.discountPercentage);

  if (this.stock <= 0) {
    this.availabilityStatus = 'Out of Stock';
  } else if (this.stock <= 10) {
    this.availabilityStatus = 'Low Stock';
  } else {
    this.availabilityStatus = 'In Stock';
  }

  next();
});

// ─── Pre-findOneAndUpdate: recalculate finalPrice ────────────────────────────
productSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const price = update.price || update['$set']?.price;
  const disc = update.discountPercentage || update['$set']?.discountPercentage;

  if (price !== undefined || disc !== undefined) {
    // We'll let the controller handle recalculation for updates
  }

  const stock = update.stock ?? update['$set']?.stock;
  if (stock !== undefined) {
    let status = 'In Stock';
    if (stock <= 0) status = 'Out of Stock';
    else if (stock <= 10) status = 'Low Stock';

    if (update['$set']) {
      update['$set'].availabilityStatus = status;
    } else {
      update.availabilityStatus = status;
    }
  }

  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
