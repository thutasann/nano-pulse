import morgan from 'morgan';
import { logger } from '../../shared/libraries/utils/logger';

/**
 * HTTP Logger Middleware
 * @description Custom morgan logger middleware for HTTP request logging
 */
export const httpLogger = morgan('short', {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    },
  },
});
