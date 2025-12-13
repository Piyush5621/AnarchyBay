// DEPENDENCIES
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

// Import utilities
import { logger } from './lib/logger.js';
import { initRedis, closeRedis } from './lib/redis.js';

// Import middleware
import { requestIdMiddleware } from './middleware/requestId.js';
import { httpLogger } from './middleware/httpLogger.js';
import { sanitizeInput } from './middleware/validation.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { rateLimiters } from './middleware/rateLimiter.js';

// Import routes
import authRoutes from './routes/auth.route.js';
import profileRoutes from './routes/profile.route.js';
import productsRoutes from './routes/product.route.js';
import fileRoutes from './routes/file.route.js';
import purchaseRoutes from './routes/purchase.route.js';
import discountRoutes from './routes/discount.route.js';
import downloadRoutes from './routes/download.route.js';
import licenseRoutes from './routes/license.route.js';
import analyticsRoutes from './routes/analytics.route.js';
import payoutRoutes from './routes/payout.route.js';
import webhookRoutes from './routes/webhook.route.js';
import adminRoutes from './routes/admin.route.js';
import reviewRoutes from './routes/review.route.js';
import wishlistRoutes from './routes/wishlist.route.js';
import cartRoutes from './routes/cart.route.js';
// import contactRoutes from './routes/contact.route.js'
import chatRoutes from './routes/chat.route.js';

// Keep-alive function to prevent Render from sleeping
const keepAwake = () => {
  const RENDER_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
  
  if (!RENDER_URL) {
    logger.info('No RENDER_EXTERNAL_URL or BACKEND_URL set, skipping keep-alive');
    return;
  }

  const ping = async () => {
    try {
      const response = await fetch(`${RENDER_URL}/health-check`);
      logger.info(`Keep-alive ping: ${response.status}`);
    } catch (error) {
      logger.error(`Keep-alive ping failed: ${error.message}`);
    }
    
    // Random sleep between 3-14 minutes
    const sleepTime = (Math.random() * 11 + 3) * 60 * 1000;
    setTimeout(ping, sleepTime);
  };

  // Start pinging after initial delay
  setTimeout(ping, 60000); // First ping after 1 minute
  logger.info('Keep-alive service started');
};

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

const app = express();

// Initialize Redis connection (only if REDIS_URL is set)
if (process.env.REDIS_URL) {
  initRedis();
}

// Security middleware - helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Compression middleware for response compression
app.use(compression());

// CORS configuration
const allowedOrigins = [
  CLIENT_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://anarchy-bay.vercel.app',
];

if (process.env.NGROK_URL) {
  allowedOrigins.push(process.env.NGROK_URL);
}

app.use(cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin matches allowed origins, ngrok pattern, or vercel pattern
      if (allowedOrigins.includes(origin) || 
          /\.ngrok-free\.app$/.test(origin) || 
          /\.ngrok\.io$/.test(origin) ||
          /\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

// Request ID tracking - must be early in middleware chain
app.use(requestIdMiddleware);

// HTTP request/response logging
app.use(httpLogger);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization to prevent XSS
app.use(sanitizeInput);

// Health check endpoint (no rate limiting)
app.get('/health-check', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
});

// Webhook routes (no rate limiting, raw body for signature verification)
app.use('/api/webhooks', webhookRoutes);

// API routes with rate limiting
app.use('/api/auth', rateLimiters.auth, authRoutes);
app.use('/api/profile', rateLimiters.api, profileRoutes);
app.use('/api/products', rateLimiters.api, productsRoutes);
app.use('/api/files', rateLimiters.api, fileRoutes);
app.use('/api/purchases', rateLimiters.api, purchaseRoutes);
app.use('/api/discounts', rateLimiters.api, discountRoutes);
app.use('/api/downloads', rateLimiters.api, downloadRoutes);
app.use('/api/licenses', rateLimiters.api, licenseRoutes);
app.use('/api/analytics', rateLimiters.api, analyticsRoutes);
app.use('/api/payouts', rateLimiters.api, payoutRoutes);
app.use('/api/admin', rateLimiters.api, adminRoutes);
app.use('/api/reviews', rateLimiters.api, reviewRoutes);
app.use('/api/wishlist', rateLimiters.api, wishlistRoutes);
app.use('/api/cart', rateLimiters.api, cartRoutes);
// app.use('/api/contact',rateLimiters.api,contactRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// Only start server if not running in Vercel
if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
      logger.info(`Server listening on http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Start keep-alive for Render
      if (process.env.RENDER) {
        keepAwake();
      }
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received, starting graceful shutdown`);
    
    server.close(async () => {
      logger.info('HTTP server closed');
      
      // Close Redis connection
      await closeRedis();
      
      logger.info('All connections closed, exiting process');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// Export for Vercel
export default app;