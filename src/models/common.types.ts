/**
 * Common pagination types and interfaces
 */

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  error?: {
    message: string;
    code: string;
  };
}

/**
 * Repository pagination options
 */
export interface PaginationOptions {
  skip: number;
  take: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated result from repository
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

/**
 * Request metadata for tracking
 */
export interface RequestMeta {
  requestId: string;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

/**
 * API client pagination parameters
 */
export interface ApiPaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

/**
 * Loading states for pagination
 */
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADING_MORE = 'loading_more',
  SUCCESS = 'success',
  ERROR = 'error'
}