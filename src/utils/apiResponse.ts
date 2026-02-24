import { Response } from 'express';

export interface ApiResponseData<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
  };
}

export class ApiResponse {
  public static success<T>(
    res: Response,
    data?: T,
    statusCode: number = 200,
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

  public static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: string
  ): Response {
    const response: ApiResponseData = {
      success: false,
      error: {
        message,
        code,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return res.status(statusCode).json(response);
  }

  public static created<T>(res: Response, data?: T, meta?: ApiResponseData<T>['meta']): Response {
    return this.success(res, data, 201, meta);
  }

  public static noContent(res: Response): Response {
    return res.status(204).send();
  }
}