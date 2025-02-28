import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../../shared/libraries/utils/response-handler.util';

/**
 * Error Handler Middleware
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  ResponseHandler.error(res, `Internal Server Error : ${err.stack}`, 500, err);
}
