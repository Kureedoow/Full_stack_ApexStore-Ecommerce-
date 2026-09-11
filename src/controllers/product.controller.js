// src/controllers/product.controller.js

import Product from '../models/Product.js';
import { successResponse, errorResponse, buildPagination } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createSlug } from '../utils/slugify.js';
import { calculateFinalPrice } from '../utils/calculatePrice.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';

// ─── Helper: build filter query ───────────────────────────────────────────────
const buildFilterQuery = (queryParams) => {
  const { search, category, brand, minPrice, maxPrice, minRating, maxRating, inStock } = queryParams;
  const filter = { isPublished: true };

  // Text / regex search
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  // Category filter
  if (category) {
    filter.category = category.toLowerCase();
  }

  // Brand filter
  if (brand) {
    filter.brand = { $regex: brand, $options: 'i' };
  }

  // Price range
  if (minPrice || maxPrice) {
    filter.finalPrice = {};
    if (minPrice) filter.finalPrice.$gte = parseFloat(minPrice);
    if (maxPrice) filter.finalPrice.$lte = parseFloat(maxPrice);
  }

  // Rating range
  if (minRating || maxRating) {
    filter.rating = {};
    if (minRating) filter.rating.$gte = parseFloat(minRating);
    if (maxRating) filter.rating.$lte = parseFloat(maxRating);
  }

  // In stock filter
  if (inStock === 'true') {
    filter.stock = { $gt: 0 };
  }

  return filter;
};

// ─── Helper: build sort query ─────────────────────────────────────────────────
const buildSortQuery = (sort) => {
  switch (sort) {
    case 'price_asc':    return { finalPrice: 1 };
    case 'price_desc':   return { finalPrice: -1 };
    case 'rating':       return { rating: -1 };
    case 'newest':       return { createdAt: -1 };
    case 'oldest':       return { createdAt: 1 };
    case 'popular':      return { soldCount: -1 };
    default:             return { createdAt: -1 };
  }
};

// ─── GET /api/products ────────────────────────────────────────────────────────
export const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const skip = (page - 1) * limit;

  const filter = buildFilterQuery(req.query);
  const sort = buildSortQuery(req.query.sort);

  const [products, totalItems] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).select('-__v'),
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

// ─── GET /api/products/:id ────────────────────────────────────────────────────
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isPublished: true,
  }).populate('createdBy', 'firstName lastName');

  if (!product) {
    return errorResponse(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
  }

  return successResponse(res, 200, 'Product retrieved successfully', product);
});

// ─── GET /api/products/slug/:slug ─────────────────────────────────────────────
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isPublished: true,
  }).populate('createdBy', 'firstName lastName');

  if (!product) {
    return errorResponse(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
  }

  return successResponse(res, 200, 'Product retrieved successfully', product);
});

// ─── POST /api/products (admin) ───────────────────────────────────────────────
export const createProduct = asyncHandler(async (req, res) => {
  const { error, value } = createProductSchema.validate(req.body, { abortEarly: false });
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

  // Generate unique slug
  let slug = createSlug(value.title);
  const existingSlug = await Product.findOne({ slug });
  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }

  const finalPrice = calculateFinalPrice(value.price, value.discountPercentage || 0);

  const product = await Product.create({
    ...value,
    slug,
    finalPrice,
    createdBy: req.user._id,
  });

  return successResponse(res, 201, 'Product created successfully', product);
});

// ─── PUT /api/products/:id (admin) ────────────────────────────────────────────
export const updateProduct = asyncHandler(async (req, res) => {
  const { error, value } = updateProductSchema.validate(req.body, { abortEarly: false });
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

  const product = await Product.findById(req.params.id);
  if (!product) {
    return errorResponse(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
  }

  // Recalculate finalPrice if price or discount changed
  const newPrice = value.price !== undefined ? value.price : product.price;
  const newDiscount =
    value.discountPercentage !== undefined ? value.discountPercentage : product.discountPercentage;
  value.finalPrice = calculateFinalPrice(newPrice, newDiscount);

  // Regenerate slug if title changed
  if (value.title) {
    let newSlug = createSlug(value.title);
    const existingSlug = await Product.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
    if (existingSlug) {
      newSlug = `${newSlug}-${Date.now()}`;
    }
    value.slug = newSlug;
  }

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: value },
    { new: true, runValidators: true }
  );

  return successResponse(res, 200, 'Product updated successfully', updated);
});

// ─── PATCH /api/products/:id (admin) ─────────────────────────────────────────
export const patchProduct = asyncHandler(async (req, res) => {
  // PATCH accepts partial updates — reuse updateProduct
  return updateProduct(req, res);
});

// ─── DELETE /api/products/:id (admin) ────────────────────────────────────────
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return errorResponse(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
  }

  await product.deleteOne();

  return successResponse(res, 200, 'Product deleted successfully');
});
