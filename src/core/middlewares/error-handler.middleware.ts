import { NextFunction, Request, Response } from 'express';
import { logger } from '../../shared/libraries/utils/logger';

/**
 * Error Handler Middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(`ERROR Handler : ${err.stack}`);
  res.status(500).json({ error: 'Internal Server Error ' });
}
