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
    pages: number;
  };
}

export class ApiResponseBuilder {
  static success<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
    };
  }

  static successWithPagination<T>(
    data: T,
    page: number,
    limit: number,
    total: number
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static error(message: string, code?: string): ApiResponse {
    return {
      success: false,
      error: {
        message,
        code,
      },
    };
  }
}