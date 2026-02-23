import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

/**
 * Environment variables validation schema
 */
const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  API_VERSION: z.string().default('v1'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).default('100'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

/**
 * Validate and parse environment variables
 */
const parseConfig = () => {
  try {
    const parsed = configSchema.parse(process.env);
    
    return {
      nodeEnv: parsed.NODE_ENV,
      port: typeof parsed.PORT === 'string' ? parseInt(parsed.PORT, 10) : parsed.PORT,
      apiVersion: parsed.API_VERSION,
      databaseUrl: parsed.DATABASE_URL,
      redisUrl: parsed.REDIS_URL,
      jwt: {
        secret: parsed.JWT_SECRET,
        expiresIn: parsed.JWT_EXPIRES_IN,
      },
      corsOrigin: parsed.CORS_ORIGIN.split(',').map(origin => origin.trim()),
      rateLimitWindowMs: typeof parsed.RATE_LIMIT_WINDOW_MS === 'string' 
        ? parseInt(parsed.RATE_LIMIT_WINDOW_MS, 10) 
        : parsed.RATE_LIMIT_WINDOW_MS,
      rateLimitMaxRequests: typeof parsed.RATE_LIMIT_MAX_REQUESTS === 'string' 
        ? parseInt(parsed.RATE_LIMIT_MAX_REQUESTS, 10) 
        : parsed.RATE_LIMIT_MAX_REQUESTS,
      logLevel: parsed.LOG_LEVEL,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
      throw new Error(`Missing or invalid environment variables: ${missingVars}`);
    }
    throw error;
  }
};

export const config = parseConfig();