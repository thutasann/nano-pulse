/**
 * Api Response
 * @description Api Response
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: string;
}

/**
 * Api Error Response
 * @description Api Error Response
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
export type ApiErrorResponse = ApiResponse<null>;

/**
 * Paginated Api Response
 * @description Paginated Api Response
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}
