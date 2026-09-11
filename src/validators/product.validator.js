// src/validators/product.validator.js
// Joi schemas for product and category endpoints

import Joi from 'joi';

export const createProductSchema = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().required(),
  price: Joi.number().min(0).required(),
  discountPercentage: Joi.number().min(0).max(100).optional().default(0),
  category: Joi.string().required(),
  brand: Joi.string().allow('').optional(),
  sku: Joi.string().allow('').optional(),
  images: Joi.array().items(Joi.string()).optional(),
  thumbnail: Joi.string().allow('').optional(),
  stock: Joi.number().min(0).required(),
  minimumOrderQuantity: Joi.number().min(1).optional().default(1),
  tags: Joi.array().items(Joi.string()).optional(),
  weight: Joi.number().min(0).optional(),
  dimensions: Joi.object({
    width: Joi.number().min(0),
    height: Joi.number().min(0),
    depth: Joi.number().min(0),
  }).optional(),
  warrantyInformation: Joi.string().allow('').optional(),
  shippingInformation: Joi.string().allow('').optional(),
  returnPolicy: Joi.string().allow('').optional(),
  isPublished: Joi.boolean().optional(),
});

export const updateProductSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  description: Joi.string().optional(),
  price: Joi.number().min(0).optional(),
  discountPercentage: Joi.number().min(0).max(100).optional(),
  category: Joi.string().optional(),
  brand: Joi.string().allow('').optional(),
  sku: Joi.string().allow('').optional(),
  images: Joi.array().items(Joi.string()).optional(),
  thumbnail: Joi.string().allow('').optional(),
  stock: Joi.number().min(0).optional(),
  minimumOrderQuantity: Joi.number().min(1).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  weight: Joi.number().min(0).optional(),
  dimensions: Joi.object({
    width: Joi.number().min(0),
    height: Joi.number().min(0),
    depth: Joi.number().min(0),
  }).optional(),
  warrantyInformation: Joi.string().allow('').optional(),
  shippingInformation: Joi.string().allow('').optional(),
  returnPolicy: Joi.string().allow('').optional(),
  isPublished: Joi.boolean().optional(),
}).min(1);

export const createCategorySchema = Joi.object({
  name: Joi.string().max(100).required().messages({ 'any.required': 'Category name is required' }),
  description: Joi.string().max(500).allow('').optional(),
  image: Joi.string().allow('').optional(),
  isActive: Joi.boolean().optional(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().max(100).optional(),
  description: Joi.string().max(500).allow('').optional(),
  image: Joi.string().allow('').optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

export const createReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required().messages({
    'any.required': 'Rating is required',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
  }),
  title: Joi.string().max(100).required().messages({ 'any.required': 'Review title is required' }),
  comment: Joi.string().max(1000).required().messages({ 'any.required': 'Comment is required' }),
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional(),
  title: Joi.string().max(100).optional(),
  comment: Joi.string().max(1000).optional(),
}).min(1);
