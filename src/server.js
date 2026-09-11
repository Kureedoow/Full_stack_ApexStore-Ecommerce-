// src/server.js
// Entry point — connects to DB and starts Express server

import './config/env.js'; // validates env vars first
import { connectDB } from './config/db.js';
import app from './app.js';
import { env } from './config/env.js';

const startServer = async () => {
  try {
    // Connect to MongoDB before accepting requests
    await connectDB();

    const server = app.listen(env.port, () => {
      console.log(`\n🚀 Server running on port ${env.port} [${env.nodeEnv}]`);
      console.log(`📡 API: http://localhost:${env.port}/api`);
      console.log(`❤️  Health: http://localhost:${env.port}/api/health\n`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('🔴 Unhandled Rejection:', err.message);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
