import { Request, Response } from 'express';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { ApiResponse } from '../models/product.model';

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response<ApiResponse<never>>): void {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: ERROR_CODES.NOT_FOUND,
    },
  });
}