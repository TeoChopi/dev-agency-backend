import { PaginationMeta, PaginationOptions, PaginationQuery } from '../models/common.types';
import { ApiError } from './errors';

/**
 * Pagination utility functions
 */

/**
 * Calculate pagination options for repository queries
 */
export function calculatePaginationOptions(query: PaginationQuery): PaginationOptions {
  const page = query.page || 1;
  const limit = query.limit || 10;
  
  return {
    skip: (page - 1) * limit,
    take: limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder || 'desc',
  };
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  currentPage: number,
  itemsPerPage: number,
  totalItems: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return {
    current_page: currentPage,
    total_pages: totalPages,
    total_items: totalItems,
    items_per_page: itemsPerPage,
    has_next_page: currentPage < totalPages,
    has_previous_page: currentPage > 1,
  };
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(page: number, limit: number): void {
  if (page < 1) {
    throw new ApiError('Page must be greater than 0', 400, 'INVALID_PAGE_NUMBER');
  }
  
  if (limit < 1 || limit > 100) {
    throw new ApiError('Limit must be between 1 and 100', 400, 'INVALID_LIMIT');
  }
}

/**
 * Calculate cursor-based pagination for performance with large datasets
 */
export function calculateCursorPagination(
  cursor?: string,
  limit: number = 10
): { cursor?: string; take: number } {
  return {
    cursor: cursor ? cursor : undefined,
    take: Math.min(limit, 100), // Cap at 100 items
  };
}

/**
 * Generate cache key for paginated results
 */
export function generatePaginationCacheKey(
  resource: string,
  page: number,
  limit: number,
  filters?: Record<string, any>
): string {
  const filterStr = filters ? JSON.stringify(filters) : '';
  return `${resource}:page:${page}:limit:${limit}:filters:${Buffer.from(filterStr).toString('base64')}`;
}