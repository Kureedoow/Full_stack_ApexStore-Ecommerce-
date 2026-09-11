// src/controllers/category.controller.js

import Category from '../models/Category.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createSlug } from '../utils/slugify.js';
import { createCategorySchema, updateCategorySchema } from '../validators/product.validator.js';

// ─── GET /api/categories ──────────────────────────────────────────────────────
export const getCategories = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;
  const filter = {};
  if (includeInactive !== 'true') filter.isActive = true;

  const categories = await Category.find(filter).sort({ name: 1 });
  return successResponse(res, 200, 'Categories retrieved successfully', categories);
});

// ─── GET /api/categories/:id ──────────────────────────────────────────────────
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return errorResponse(res, 404, 'Category not found', 'CATEGORY_NOT_FOUND');
  }
  return successResponse(res, 200, 'Category retrieved successfully', category);
});

// ─── POST /api/categories (admin) ────────────────────────────────────────────
export const createCategory = asyncHandler(async (req, res) => {
  const { error, value } = createCategorySchema.validate(req.body, { abortEarly: false });
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

  const slug = createSlug(value.name);
  const existing = await Category.findOne({ slug });
  if (existing) {
    return errorResponse(res, 409, 'Category with this name already exists', 'DUPLICATE_KEY');
  }

  const category = await Category.create({ ...value, slug });
  return successResponse(res, 201, 'Category created successfully', category);
});

// ─── PUT /api/categories/:id (admin) ─────────────────────────────────────────
export const updateCategory = asyncHandler(async (req, res) => {
  const { error, value } = updateCategorySchema.validate(req.body, { abortEarly: false });
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

  if (value.name) {
    value.slug = createSlug(value.name);
    const existing = await Category.findOne({ slug: value.slug, _id: { $ne: req.params.id } });
    if (existing) {
      return errorResponse(res, 409, 'Category with this name already exists', 'DUPLICATE_KEY');
    }
  }

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { $set: value },
    { new: true, runValidators: true }
  );

  if (!category) {
    return errorResponse(res, 404, 'Category not found', 'CATEGORY_NOT_FOUND');
  }

  return successResponse(res, 200, 'Category updated successfully', category);
});

// ─── DELETE /api/categories/:id (admin) ──────────────────────────────────────
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return errorResponse(res, 404, 'Category not found', 'CATEGORY_NOT_FOUND');
  }

  await category.deleteOne();
  return successResponse(res, 200, 'Category deleted successfully');
});
