// api/index.js
// Vercel Serverless Function entry point for ApexStore Express Backend

import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection error in Vercel serverless handler:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Ensure MONGODB_URI is correctly configured in Vercel Environment Variables.',
      error: error.message,
    });
  }

  return app(req, res);
}
