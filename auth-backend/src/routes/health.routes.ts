import { Router, Request, Response } from 'express';
import { getSupabaseClient } from '../config/supabase';

const router = Router();

// Track server start time for uptime calculation
const serverStartTime = Date.now();

// Simple metrics tracking
const metrics = {
  requestCount: 0,
  errorCount: 0,
  totalResponseTime: 0,
};

/**
 * GET /health
 * Health check endpoint
 * Returns service status and database connectivity
 */
router.get('/health', async (_req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    // Check database connectivity
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('profiles').select('id').limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      // Database is unreachable
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - serverStartTime) / 1000),
        database: {
          status: 'disconnected',
          error: 'Database connection failed',
        },
        responseTime: `${responseTime}ms`,
      });
      return;
    }

    // Service is healthy
    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - serverStartTime) / 1000),
      database: {
        status: 'connected',
      },
      responseTime: `${responseTime}ms`,
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Service is unhealthy
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - serverStartTime) / 1000),
      database: {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      responseTime: `${responseTime}ms`,
    });
  }
});

/**
 * GET /metrics
 * Metrics endpoint for monitoring
 * Returns request counts and response times
 */
router.get('/metrics', (_req: Request, res: Response) => {
  const uptime = Math.floor((Date.now() - serverStartTime) / 1000);
  const averageResponseTime =
    metrics.requestCount > 0
      ? Math.floor(metrics.totalResponseTime / metrics.requestCount)
      : 0;

  res.status(200).json({
    success: true,
    metrics: {
      uptime: `${uptime}s`,
      requests: {
        total: metrics.requestCount,
        errors: metrics.errorCount,
        successRate:
          metrics.requestCount > 0
            ? (
                ((metrics.requestCount - metrics.errorCount) /
                  metrics.requestCount) *
                100
              ).toFixed(2) + '%'
            : '100%',
      },
      performance: {
        averageResponseTime: `${averageResponseTime}ms`,
      },
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * Middleware to track metrics
 * Should be applied globally in app.ts
 */
export const metricsMiddleware = (
  _req: Request,
  res: Response,
  next: Function
) => {
  const startTime = Date.now();

  // Increment request count
  metrics.requestCount++;

  // Track response
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    metrics.totalResponseTime += responseTime;

    // Track errors
    if (res.statusCode >= 400) {
      metrics.errorCount++;
    }
  });

  next();
};

export default router;
