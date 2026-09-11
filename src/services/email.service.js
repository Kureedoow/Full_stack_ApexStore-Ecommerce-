// src/services/email.service.js
// Email service — currently logs to console; configure SMTP to send real emails

import { env } from '../config/env.js';

/**
 * Send an email (stub — integrate nodemailer/SendGrid when ready)
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body (optional)
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  if (env.isDevelopment) {
    console.log(`📧 [EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(`   Body: ${text}`);
    return;
  }

  // TODO: Replace with real email provider
  // Example with nodemailer:
  // const transporter = nodemailer.createTransport({
  //   host: env.email.host,
  //   port: env.email.port,
  //   auth: { user: env.email.user, pass: env.email.pass },
  // });
  // await transporter.sendMail({ from: env.email.from, to, subject, text, html });
};

/**
 * Send order confirmation email to user
 */
export const sendOrderConfirmation = async (user, order) => {
  await sendEmail({
    to: user.email,
    subject: `Order Confirmed — #${order._id}`,
    text: `Hi ${user.firstName}, your order #${order._id} has been confirmed. Total: $${order.totalPrice}. Thank you for shopping with us!`,
  });
};

/**
 * Send order status update email
 */
export const sendOrderStatusUpdate = async (user, order) => {
  await sendEmail({
    to: user.email,
    subject: `Order Update — #${order._id}`,
    text: `Hi ${user.firstName}, your order #${order._id} status has been updated to: ${order.orderStatus}.`,
  });
};
