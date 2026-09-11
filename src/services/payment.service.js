// src/services/payment.service.js
// Payment service layer — designed to be easily extended with Stripe/PayPal/etc.
// Currently supports cash_on_delivery and mock online payment

/**
 * Process a payment based on method
 * @param {object} params
 * @param {string} params.method - Payment method
 * @param {number} params.amount - Total amount to charge
 * @param {string} params.orderId - Order ID for reference
 * @param {object} params.paymentDetails - Additional payment details (card token, etc.)
 * @returns {Promise<{success, transactionId, status, message}>}
 */
export const processPayment = async ({ method, amount, orderId, paymentDetails = {} }) => {
  switch (method) {
    case 'cash_on_delivery':
      // No processing needed — payment collected at delivery
      return {
        success: true,
        transactionId: null,
        status: 'pending',
        message: 'Order placed. Payment to be collected on delivery.',
      };

    case 'card':
      // TODO: Integrate Stripe here
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      // const paymentIntent = await stripe.paymentIntents.create({ amount: amount * 100, currency: 'usd' });
      return {
        success: true,
        transactionId: `MOCK_CARD_${Date.now()}`,
        status: 'paid',
        message: 'Card payment processed successfully (mock).',
      };

    case 'mobile_payment':
      // TODO: Integrate bKash, SSLCommerz, etc.
      return {
        success: true,
        transactionId: `MOCK_MOBILE_${Date.now()}`,
        status: 'paid',
        message: 'Mobile payment processed successfully (mock).',
      };

    case 'online_payment':
      // TODO: Integrate PayPal, etc.
      return {
        success: true,
        transactionId: `MOCK_ONLINE_${Date.now()}`,
        status: 'paid',
        message: 'Online payment processed successfully (mock).',
      };

    default:
      return {
        success: false,
        transactionId: null,
        status: 'failed',
        message: 'Unsupported payment method.',
      };
  }
};

/**
 * Refund a payment
 * @param {string} transactionId
 * @param {number} amount
 * @returns {Promise<{success, message}>}
 */
export const refundPayment = async (transactionId, amount) => {
  // TODO: Integrate real refund via Stripe/PayPal when ready
  if (!transactionId) {
    return { success: true, message: 'No transaction to refund (cash on delivery).' };
  }

  return {
    success: true,
    message: `Refund of $${amount} initiated for transaction ${transactionId} (mock).`,
  };
};
