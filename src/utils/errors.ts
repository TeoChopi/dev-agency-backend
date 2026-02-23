export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code?: string): ApiError {
    return new ApiError(message, 400, code);
  }

  static unauthorized(message: string = 'Unauthorized', code?: string): ApiError {
    return new ApiError(message, 401, code);
  }

  static forbidden(message: string = 'Forbidden', code?: string): ApiError {
    return new ApiError(message, 403, code);
  }

  static notFound(message: string = 'Resource not found', code?: string): ApiError {
    return new ApiError(message, 404, code);
  }

  static conflict(message: string, code?: string): ApiError {
    return new ApiError(message, 409, code);
  }

  static internal(message: string = 'Internal server error', code?: string): ApiError {
    return new ApiError(message, 500, code);
  }
}