import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from 'socket.io-redis';
import { logger } from '../../../shared/libraries/utils/logger';
import { getRedisUrl } from '../../connections/redis-connection';

/**
 * Initialize Sockets
 * @description Initialize Socket.io server
 * @param httpServer - Http Server
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 * @since 2025-02-27
 */
export function initialize_socket(httpServer: HTTPServer) {
  try {
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket'],
      pingInterval: 25000,
      pingTimeout: 120000,
      upgradeTimeout: 30000,
      maxHttpBufferSize: 1e7,
    });

    const redis_url = getRedisUrl();
    io.adapter(createAdapter(redis_url));

    io.on('connection', (socket) => {
      logger.info(`New Client Connected : ${socket.id}`);

      socket.on('disconnect', () => {
        logger.warning(`Client Disconnected : ${socket.id}`);
      });
    });

    logger.success(`Socket Initialized`);
  } catch (error) {
    logger.error(`Socket Initialized Fail : ${error}`);
  }
}
