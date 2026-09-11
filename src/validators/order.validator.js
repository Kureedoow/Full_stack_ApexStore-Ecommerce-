// src/validators/order.validator.js

import Joi from 'joi';

const shippingAddressSchema = Joi.object({
  fullName: Joi.string().trim().required().messages({
    'any.required': 'Recipient full name is required',
    'string.empty': 'Recipient full name cannot be empty',
  }),
  phone: Joi.string().trim().allow('', null).optional().default(''),
  addressLine1: Joi.string().trim().required().messages({
    'any.required': 'Street address is required',
    'string.empty': 'Street address cannot be empty',
  }),
  addressLine2: Joi.string().trim().allow('', null).optional().default(''),
  city: Joi.string().trim().required().messages({
    'any.required': 'City is required',
    'string.empty': 'City cannot be empty',
  }),
  state: Joi.string().trim().required().messages({
    'any.required': 'State is required',
    'string.empty': 'State cannot be empty',
  }),
  postalCode: Joi.string().trim().required().messages({
    'any.required': 'Postal code is required',
    'string.empty': 'Postal code cannot be empty',
  }),
  country: Joi.string().trim().allow('', null).optional().default('United States'),
}).options({ stripUnknown: true, allowUnknown: true });

export const createOrderSchema = Joi.object({
  shippingAddress: shippingAddressSchema.required().messages({
    'any.required': 'Shipping address is required',
  }),
  paymentMethod: Joi.string()
    .valid('cash_on_delivery', 'card', 'mobile_payment', 'online_payment')
    .default('card')
    .optional()
    .messages({
      'any.only': 'Invalid payment method',
    }),
  couponCode: Joi.string().trim().allow('', null).optional(),
  notes: Joi.string().trim().max(500).allow('', null).optional().default(''),
}).options({ stripUnknown: true, allowUnknown: true });

export const updateOrderStatusSchema = Joi.object({
  orderStatus: Joi.string()
    .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
    .required()
    .messages({
      'any.required': 'Order status is required',
      'any.only': 'Invalid order status',
    }),
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded').allow('', null).optional(),
  note: Joi.string().allow('', null).optional().default(''),
}).options({ stripUnknown: true, allowUnknown: true });

