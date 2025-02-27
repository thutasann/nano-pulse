import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
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
