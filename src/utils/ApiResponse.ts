import { Response } from 'express';

/**
 * Standard API response interface
 */
export interface ApiResponseData<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * API Response utility class
 */
export class ApiResponse {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data?: T,
    statusCode = 200,
    meta?: ApiResponseData<T>['meta']
  ): Response {
    const response: ApiResponseData<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string,
    statusCode = 500,
    code = 'INTERNAL_SERVER_ERROR',
    details?: unknown
  ): Response {
    const response: ApiResponseData = {
      success: false,
      error: {
        message,
        code,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send created response (201)
   */
  static created<T>(res: Response, data?: T, meta?: ApiResponseData<T>['meta']): Response {
    return ApiResponse.success(res, data, 201, meta);
  }

  /**
   * Send no content response (204)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  ): Response {
    return ApiResponse.success(res, data, 200, {
      pagination,
    });
  }
}