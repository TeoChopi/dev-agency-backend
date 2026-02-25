import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { generateRequestId } from '../utils/request';

/**
 * Request/Response logging middleware for better debugging
 */

export interface RequestWithId extends Request {
  requestId: string;
  startTime: number;
}

/**
 * Request logging middleware
 */
export const requestLogger = (req: RequestWithId, res: Response, next: NextFunction): void => {
  // Generate unique request ID
  req.requestId = generateRequestId();
  req.startTime = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    query: req.query,
    params: req.params,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    timestamp: new Date().toISOString(),
  });

  // Log request body for non-GET requests (excluding sensitive data)
  if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = sanitizeRequestBody(req.body);
    logger.info('Request body', {
      requestId: req.requestId,
      body: sanitizedBody,
    });
  }

  next();
};

/**
 * Response logging middleware
 */
export const responseLogger = (req: RequestWithId, res: Response, next: NextFunction): void => {
  const originalSend = res.send;
  const originalJson = res.json;

  // Override res.send to log response
  res.send = function (body: any) {
    logResponse(req, res, body);
    return originalSend.call(this, body);
  };

  // Override res.json to log response
  res.json = function (body: any) {
    logResponse(req, res, body);
    return originalJson.call(this, body);
  };

  next();
};

/**
 * Log response details
 */
function logResponse(req: RequestWithId, res: Response, body: any): void {
  const duration = Date.now() - req.startTime;
  
  // Log basic response info
  logger.info('Outgoing response', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    contentLength: res.get('Content-Length'),
    timestamp: new Date().toISOString(),
  });

  // Log response body for errors or debug level
  if (res.statusCode >= 400 || process.env.LOG_LEVEL === 'debug') {
    const sanitizedBody = sanitizeResponseBody(body);
    logger.info('Response body', {
      requestId: req.requestId,
      statusCode: res.statusCode,
      body: sanitizedBody,
    });
  }

  // Log performance warnings for slow requests
  if (duration > 5000) { // 5 seconds
    logger.warn('Slow request detected', {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      duration: `${duration}ms`,
      statusCode: res.statusCode,
    });
  }

  // Log pagination metrics for paginated endpoints
  if (req.path.includes('/products') && req.method === 'GET' && typeof body === 'object' && body?.pagination) {
    logger.info('Pagination metrics', {
      requestId: req.requestId,
      pagination: {
        currentPage: body.pagination.current_page,
        totalPages: body.pagination.total_pages,
        totalItems: body.pagination.total_items,
        itemsPerPage: body.pagination.items_per_page,
        itemsReturned: body.data?.length || 0,
      },
    });
  }
}

/**
 * Sanitize request body by removing sensitive fields
 */
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Sanitize response body by limiting size and removing sensitive data
 */
function sanitizeResponseBody(body: any): any {
  if (!body) {
    return body;
  }

  try {
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    
    // Limit response body size in logs
    if (bodyString.length > 10000) { // 10KB limit
      return {
        message: '[Response body too large for logging]',
        size: `${bodyString.length} characters`,
        preview: bodyString.substring(0, 500) + '...',
      };
    }

    return typeof body === 'string' ? body : body;
  } catch (error) {
    return {
      message: '[Failed to serialize response body]',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Add request ID to response headers
 */
export const addRequestIdHeader = (req: RequestWithId, res: Response, next: NextFunction): void => {
  res.set('X-Request-ID', req.requestId);
  next();
};

/**
 * Combined middleware for request/response logging
 */
export const requestResponseLogger = [
  requestLogger,
  responseLogger,
  addRequestIdHeader,
];