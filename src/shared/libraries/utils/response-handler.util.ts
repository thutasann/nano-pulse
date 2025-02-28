import { Response } from 'express';
import { ApiResponse, PaginatedApiResponse } from '../../types/response.type';
import { logger } from './logger';

/**
 * Response Handler
 * @description Response Handler Utility Function
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
export class ResponseHandler {
  /**
   * Success Response
   * @example
   * ResponseHandler.success(res, data, 'Success', 200);
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString(),
    };
    logger.success(`[${statusCode}] ${message}`);
    return res.status(statusCode).json(response);
  }

  /**
   * Error Response
   * @example
   * ResponseHandler.error(res, 'Internal Server Error', 500, error);
   */
  static error(
    res: Response,
    message: string = 'Internal Server Error',
    statusCode: number = 500,
    error?: any
  ): Response<ApiResponse<null>> {
    const response: ApiResponse<null> = {
      success: false,
      message,
      error: error?.message || error,
      statusCode,
      timestamp: new Date().toISOString(),
    };
    logger.error(`[${statusCode}] ${message} ${error ? `: ${error}` : ''}`);
    return res.status(statusCode).json(response);
  }

  /**
   * Paginated Response
   * @example
   * ResponseHandler.paginated(res, data, total, page, limit, 'Success', 200);
   */
  static paginated<T>(
    res: Response,
    data: T,
    total: number,
    page: number,
    limit: number,
    message: string = 'Success',
    statusCode: number = 200
  ): Response<PaginatedApiResponse<T>> {
    const response: PaginatedApiResponse<T> = {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString(),
      pagination: {
        total,
        page,
        limit,
        hasMore: total > page * limit,
      },
    };
    logger.success(`[${statusCode}] ${message} - Page ${page}`);
    return res.status(statusCode).json(response);
  }

  /**
   * Created Response
   * @example
   * ResponseHandler.created(res, data, 'Resource created successfully');
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response<ApiResponse<T>> {
    return this.success(res, data, message, 201);
  }

  /**
   * Bad Request Response
   * @example
   * ResponseHandler.badRequest(res, 'Bad request', error);
   */
  static badRequest(res: Response, message: string = 'Bad request', error?: any): Response<ApiResponse<null>> {
    return this.error(res, message, 400, error);
  }

  /**
   * Unauthorized Response
   * @example
   * ResponseHandler.unauthorized(res, 'Unauthorized', error);
   */
  static unauthorized(res: Response, message: string = 'Unauthorized', error?: any): Response<ApiResponse<null>> {
    return this.error(res, message, 401, error);
  }

  /**
   * Forbidden Response
   * @example
   * ResponseHandler.forbidden(res, 'Forbidden', error);
   */
  static forbidden(res: Response, message: string = 'Forbidden', error?: any): Response<ApiResponse<null>> {
    return this.error(res, message, 403, error);
  }

  /**
   * Not Found Response
   * @example
   * ResponseHandler.notFound(res, 'Resource not found', error);
   */
  static notFound(res: Response, message: string = 'Resource not found', error?: any): Response<ApiResponse<null>> {
    return this.error(res, message, 404, error);
  }

  /**
   * Validation Error Response
   * @example
   * ResponseHandler.validationError(res, error, 'Validation failed');
   */
  static validationError(
    res: Response,
    error: any,
    message: string = 'Validation failed'
  ): Response<ApiResponse<null>> {
    return this.error(res, message, 422, error);
  }

  /**
   * Too Many Requests Response
   * @example
   * ResponseHandler.tooManyRequests(res, 'Too many requests', error);
   */
  static tooManyRequests(
    res: Response,
    message: string = 'Too many requests',
    error?: any
  ): Response<ApiResponse<null>> {
    return this.error(res, message, 429, error);
  }
}
