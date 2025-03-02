import { Server as HTTPServer } from 'http';
import { socket } from '../../../shared/libraries/socket/socket.service';
import { logger } from '../../../shared/libraries/utils/logger';

/**
 * Initialize Sockets
 * @description Initialize Socket.io server
 * @param httpServer - Http Server
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 * @since 2025-02-27
 */
export function initializeSocket(httpServer: HTTPServer) {
  try {
    socket.initialize(httpServer);
  } catch (error) {
    logger.error(`Socket Initialized Fail : ${error}`);
  }
}
