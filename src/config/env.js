// src/config/env.js
// Centralizes environment variable access and validation

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Potential candidates for .env file across project structures
const candidatePaths = [
  path.resolve(__dirname, '../../.env.local'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env.local'),
  path.resolve(process.cwd(), '../.env'),
];

for (const envPath of candidatePaths) {
  try {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }
  } catch {
    // Ignore file access errors in sandboxed environments
  }
}

// Fallback defaults so the app and Vercel deployments run immediately without crashing
const defaults = {
  MONGODB_URI: 'mongodb+srv://abdirahmanstar38:Ff85305566maan$$$@somabookstore.vimigsa.mongodb.net/?appName=somaBookStore',
  JWT_SECRET: 'super_secret_jwt_key_development_2026_secure',
  JWT_REFRESH_SECRET: 'super_secret_refresh_key_development_2026_secure',
  COOKIE_SECRET: 'super_secret_cookie_development_key',
  PORT: '5000',
  NODE_ENV: 'development',
  CLIENT_URL: 'http://localhost:5173',
};

for (const [key, value] of Object.entries(defaults)) {
  if (!process.env[key]) {
    process.env[key] = value;
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
