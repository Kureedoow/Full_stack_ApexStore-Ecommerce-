// src/app.js
// Express application setup — all middleware and routes registered here

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import cartRoutes from './routes/cart.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import reviewRoutes, { reviewRouter } from './routes/review.routes.js';
import orderRoutes from './routes/order.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Middleware
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';

const app = express();

// ─── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());

// Allow both common Vite dev ports in development
const allowedOrigins = [
  env.client.url,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true, // allow cookies to be sent cross-origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Request parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.cookie.secret));

// ─── Logging ───────────────────────────────────────────────────────────────────
if (env.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── General rate limiting ─────────────────────────────────────────────────────
app.use('/api/', generalLimiter);

// ─── Health check & Root endpoint ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ApexStore E-Commerce API is running',
    health: '/api/health',
    environment: env.nodeEnv,
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'E-Commerce API is running',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Product-nested review routes: GET|POST /api/products/:productId/reviews
app.use('/api/products/:productId/reviews', reviewRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Standalone review routes: PUT|DELETE /api/reviews/:id
app.use('/api/reviews', reviewRouter);

app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 handler ───────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

export default app;
