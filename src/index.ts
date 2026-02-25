import 'express-async-errors';
import { createServer } from './server';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';
import { env } from './config/env';

/**
 * Application entry point
 */
async function bootstrap(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Create Express server
    const app = createServer();

    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${env.PORT}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${env.PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
bootstrap();