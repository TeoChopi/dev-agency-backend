import { Request, Response } from 'express';
import { HTTP_STATUS } from '../utils/constants';
import { env } from '../config/env';
import { ApiResponse } from '../models/product.model';

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

/**
 * Health check controller
 */
class HealthController {
  /**
   * Health check endpoint
   */
  async check(_req: Request, res: Response<ApiResponse<HealthData>>): Promise<void> {
    const healthData: HealthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: healthData,
    });
  }
}

export const healthController = new HealthController();