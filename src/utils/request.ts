import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

/**
 * Request utility functions
 */

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return uuidv4();
}

/**
 * Generate shorter request ID for performance-sensitive scenarios
 */
export function generateShortRequestId(): string {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Extract client IP address from request
 */
export function getClientIp(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

/**
 * Extract user agent from request
 */
export function getUserAgent(req: any): string {
  return req.headers['user-agent'] || 'unknown';
}

/**
 * Check if request is from mobile device
 */
export function isMobileRequest(req: any): boolean {
  const userAgent = getUserAgent(req).toLowerCase();
  const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'tablet'];
  return mobileKeywords.some(keyword => userAgent.includes(keyword));
}

/**
 * Extract request metadata
 */
export function extractRequestMeta(req: any): {
  requestId: string;
  ip: string;
  userAgent: string;
  isMobile: boolean;
  timestamp: Date;
} {
  return {
    requestId: req.requestId || generateRequestId(),
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
    isMobile: isMobileRequest(req),
    timestamp: new Date(),
  };
}