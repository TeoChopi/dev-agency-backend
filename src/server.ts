import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/request-logger.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { productsRouter } from './routes/products.routes';
import { healthRouter } from './routes/health.routes';

/**
 * Swagger configuration
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Products API',
      version: '1.0.0',
      description: 'REST API for products with pagination support',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const specs = swaggerJsdoc(swaggerOptions);

/**
 * Create Express application with middleware and routes
 */
export function createServer(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.use(cors({
    origin: env.NODE_ENV === 'development' ? true : [],
    credentials: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: {
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later',
        code: 'TOO_MANY_REQUESTS',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(limiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use(requestLogger);

  // API Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  // Health check route
  app.use('/health', healthRouter);

  // API routes
  app.use(`/api/${env.API_VERSION}/products`, productsRouter);

  // 404 handler for undefined routes
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  logger.info('Express server configured successfully');

  return app;
}