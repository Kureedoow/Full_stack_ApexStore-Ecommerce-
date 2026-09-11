// src/utils/apiResponse.js
// Standardized API response helpers used across all controllers

/**
 * Send a successful response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message - Human-readable success message
 * @param {*} data - Response payload
 * @param {object} meta - Optional metadata (pagination, etc.)
 */
export const successResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) response.data = data;
  if (meta !== null) response.pagination = meta;

  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} message - Human-readable error message
 * @param {string} errorCode - Machine-readable error code
 * @param {*} errors - Validation errors or extra details
 */
export const errorResponse = (res, statusCode = 500, message = 'Something went wrong', errorCode = 'INTERNAL_ERROR', errors = null) => {
  const response = {
    success: false,
    message,
    error: {
      code: errorCode,
    },
  };

  if (errors !== null) response.error.details = errors;

  return res.status(statusCode).json(response);
};

/**
 * Build pagination metadata for list responses
 */
export const buildPagination = (page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};
