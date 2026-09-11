// src/utils/calculatePrice.js
// Pure price calculation functions used in cart, checkout, and orders

/**
 * Calculate the final price after applying a discount percentage
 * @param {number} price - Original price
 * @param {number} discountPercentage - Discount as a percentage (0–100)
 * @returns {number} Final price rounded to 2 decimal places
 */
export const calculateFinalPrice = (price, discountPercentage = 0) => {
  if (!discountPercentage || discountPercentage <= 0) return parseFloat(price.toFixed(2));
  const discount = (price * discountPercentage) / 100;
  return parseFloat((price - discount).toFixed(2));
};

/**
 * Calculate the subtotal for a cart item
 * @param {number} price - Unit price
 * @param {number} quantity - Quantity
 * @returns {number}
 */
export const calculateItemSubtotal = (price, quantity) => {
  return parseFloat((price * quantity).toFixed(2));
};

/**
 * Calculate the cart totals from an array of items
 * @param {Array} items - Cart items [ { price, quantity } ]
 * @returns {{ subtotal, totalItems }}
 */
export const calculateCartTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalItems,
  };
};

/**
 * Calculate the coupon discount amount
 * @param {number} subtotal - Cart subtotal
 * @param {object} coupon - Coupon document from DB
 * @returns {number} discount amount
 */
export const calculateCouponDiscount = (subtotal, coupon) => {
  if (!coupon) return 0;

  let discount = 0;

  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
    // Cap at maximumDiscount if set
    if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
      discount = coupon.maximumDiscount;
    }
  } else if (coupon.discountType === 'fixed') {
    discount = coupon.discountValue;
  }

  // Discount cannot exceed subtotal
  return parseFloat(Math.min(discount, subtotal).toFixed(2));
};

/**
 * Calculate the shipping fee
 * (Simple logic — extend as needed for real shipping APIs)
 * @param {number} subtotal - Cart subtotal after discount
 * @returns {number} shipping fee
 */
export const calculateShippingFee = (subtotal) => {
  if (subtotal >= 100) return 0;   // Free shipping over $100
  return 9.99;
};

/**
 * Calculate tax amount
 * @param {number} amount - Taxable amount
 * @param {number} taxRate - Tax rate as a decimal (e.g. 0.1 = 10%)
 * @returns {number}
 */
export const calculateTax = (amount, taxRate = 0.1) => {
  return parseFloat((amount * taxRate).toFixed(2));
};

/**
 * Calculate the complete order total
 */
export const calculateOrderTotal = (subtotal, discount, shippingFee, tax) => {
  return parseFloat((subtotal - discount + shippingFee + tax).toFixed(2));
};
