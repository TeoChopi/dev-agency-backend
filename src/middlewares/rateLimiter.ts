import rateLimit from 'express-rate-limit';
import { env } from '@/config/env';
import { ApiResponse } from '@/utils/apiResponse';

export const createRateLimiter = (windowMs?: number, max?: number) => {
  return rateLimit({
    windowMs: windowMs || env.RATE_LIMIT_WINDOW_MS,
    max: max || env.RATE_LIMIT_MAX_REQUESTS,
    message: {
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return ApiResponse.error(
        res,
        'Too many requests from this IP, please try again later',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    },
  });
};

export const globalRateLimiter = createRateLimiter();