// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import logger from './config/logger';
import { getEnvConfig } from './config/env';
import { validateDatabaseConnection, closeConnection } from './config/supabase';
import { schedulerService } from './services/scheduler.service';
import { emailService } from './services/email.service';

// Note: Environment validation is now handled by getEnvConfig() in config/env.ts
// which is called during app initialization

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Validate environment variables and get configuration
    logger.info('Validating environment configuration...');
    const config = getEnvConfig();

    // Validate database connection
    logger.info('Validating database connection...');
    await validateDatabaseConnection();
    logger.info('Database connection validated successfully');

    // Verify email service configuration
    if (emailService.isEmailConfigured()) {
      const emailVerified = await emailService.verifyConnection();
      if (emailVerified) {
        logger.info('Email service configured and verified successfully');
      } else {
        logger.warn('Email service configured but verification failed');
      }
    } else {
      logger.warn('Email service not configured - email notifications will be disabled');
    }

    // Create Express app
    const app = createApp();

    // Get port and environment from validated config
    const PORT = config.port;
    const NODE_ENV = config.nodeEnv;

    // Start server
    const server = app.listen(PORT, () => {
      logger.info('Server started successfully', {
        port: PORT,
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
      });

      // Start scheduler service for notifications
      schedulerService.start();

      if (NODE_ENV === 'development') {
        logger.info(`Server is running at http://localhost:${PORT}`);
        logger.info(`Health check: http://localhost:${PORT}/health`);
        logger.info(`API endpoints: http://localhost:${PORT}/api/auth`);
      }
    });

    // Graceful shutdown handler
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown...`);

      // Stop scheduler
      schedulerService.stop();
      logger.info('Scheduler service stopped');

      server.close(() => {
        logger.info('HTTP server closed');

        // Close database connection
        closeConnection();
        logger.info('Database connection closed');

        logger.info('Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught exception:', {
        error: error.message,
        stack: error.stack,
      });
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled promise rejection:', {
        reason: reason instanceof Error ? reason.message : reason,
        stack: reason instanceof Error ? reason.stack : undefined,
      });
      gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    logger.error('Failed to start server:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
};

// Start the server
startServer();


