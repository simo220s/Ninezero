import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { requestLogger } from './middleware/request-logger.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { generalRateLimiter } from './middleware/rate-limit.middleware';
import {
  enforceHttps,
  httpsSecurityHeaders,
} from './middleware/https.middleware';
import { auditMiddleware } from './middleware/audit.middleware';
import healthRoutes, { metricsMiddleware } from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import notificationRoutes from './routes/notification.routes';
import classRoutes from './routes/class.routes';
import conversionRoutes from './routes/conversion.routes';
import auditRoutes from './routes/audit.routes';

/**
 * Create and configure Express application
 */
export const createApp = (): Application => {
  const app = express();

  // HTTPS enforcement (production only)
  app.use(enforceHttps);
  app.use(httpsSecurityHeaders);

  // Security middleware - helmet for security headers
  app.use(helmet());

  // CORS configuration
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (corsOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Metrics tracking middleware
  app.use(metricsMiddleware);

  // Request logging middleware
  app.use(requestLogger);

  // Audit middleware (extract IP and user agent)
  app.use(auditMiddleware);

  // General rate limiting (100 requests per 15 minutes)
  app.use('/api', generalRateLimiter);

  // Health check routes (no /api prefix for easier monitoring)
  app.use('/', healthRoutes);

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/classes', classRoutes);
  app.use('/api/conversion', conversionRoutes);
  app.use('/api/audit', auditRoutes);

  // 404 handler for undefined routes
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;
