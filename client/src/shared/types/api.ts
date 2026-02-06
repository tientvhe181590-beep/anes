/**
 * Standard API response envelope.
 * All backend endpoints return this shape.
 */
export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta | null;
  error: ApiError | null;
}

export interface ApiMeta {
  timestamp: string;
  page?: number;
  pageSize?: number;
  totalCount?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

/**
 * Paginated wrapper for list endpoints.
 */
export interface PaginatedData<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
