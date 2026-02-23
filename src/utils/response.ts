export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
});

export const createErrorResponse = (message: string, code?: string): ApiResponse => ({
  success: false,
  error: {
    message,
    code,
  },
});

export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => ({
  success: true,
  data,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});