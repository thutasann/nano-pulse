import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from 'socket.io-redis';
import { getRedisUrl } from '../database/redis-connection';
import { logger } from '../utils/logger';

/**
 * Initialize Sockets
 * @param httpServer - Http Server
 */
export function initializeSocket(httpServer: HTTPServer) {
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
