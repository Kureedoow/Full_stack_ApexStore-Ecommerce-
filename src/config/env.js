// src/config/env.js
// Centralizes environment variable access and validation

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly from the project root regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // Fallback for standard environments

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error('\n❌ Missing required environment variable(s):', missingVars.join(', '));
  console.error('👉 For local development: Ensure your .env file at the project root contains these variables.');
  console.error('👉 For Vercel deployment: Add these variables in the Vercel Dashboard: Settings -> Environment Variables.\n');
  if (!process.env.VERCEL) {
    process.exit(1);
  }
}

export const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',

  mongodb: {
    uri: process.env.MONGODB_URI,
  },

  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  cookie: {
    secret: process.env.COOKIE_SECRET || 'cookie_secret',
  },

  client: {
    url: process.env.CLIENT_URL || 'http://localhost:5173',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
  },
};
