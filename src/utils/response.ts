import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ResponseHandler {
  static success<T>(
    res: Response,
    data?: T,
    statusCode: number = 200,
    pagination?: ApiResponse<T>['pagination']
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(pagination && { pagination }),
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: string
  ): Response<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      error: {
        message,
        ...(code && { code }),
      },
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data?: T): Response<ApiResponse<T>> {
    return this.success(res, data, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}