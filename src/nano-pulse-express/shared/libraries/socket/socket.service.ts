import { Server as HTTPServer } from 'http';
import { ServerOptions, Server as SocketIOServer } from 'socket.io';
import { createAdapter } from 'socket.io-redis';
import { getRedisUrl } from '../../../core/connections/redis-connection';
import { MessagePayload } from '../../types/socket/socket-payload.type';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  TypedServer,
  TypedSocket,
} from '../../types/socket/socket.type';
import { logger } from '../utils/logger';

/**
 * Socket Service that extends the Socket.IO Server
 * @description Socket Service that extends the Socket.IO Server
 */
class SocketService {
  private static instance: SocketService;
  private io: TypedServer | null = null;
  private readonly defaultOptions: Partial<ServerOptions> = {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket'],
    pingInterval: 25000,
    pingTimeout: 120000,
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e7,
  };

  private constructor() {} // Empty private constructor

  /**
   * Initialize Socket Service
   * @description Initialize the Socket.IO Server with HTTP server
   * This should be called once when starting your application
   */
  public initialize(server: HTTPServer): void {
    if (this.io) {
      logger.warning('Socket.IO server is already initialized');
      return;
    }

    this.io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
      server,
      this.defaultOptions
    );

    const redisUrl = getRedisUrl();
    this.io.adapter(createAdapter(redisUrl));

    this.initializeMiddleware();
    this.start();
  }

  /**
   * Get Socket Service Instance
   * @returns The Socket Service instance
   */
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  /**
   * Ensure IO is initialized
   */
  private ensureIOInitialized(): TypedServer {
    if (!this.io) {
      throw new Error('Socket.IO server is not initialized. Call initialize() first.');
    }
    return this.io;
  }

  /**
   * Initialize Middleware
   * @description Initialize the middleware for the Socket.IO Server
   * @author [thutasann](https://github.com/thutasann)
   */
  private initializeMiddleware(): void {
    const io = this.ensureIOInitialized();
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth['token'] || socket.handshake.headers.authorization;
        if (!token) {
          logger.error('Socket Authentication token required');
          throw new Error('Authentication token required');
        }
        socket.data.userId = 'user_id';
        socket.data.username = 'username';
        socket.data.connectedAt = new Date();
        next();
      } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
      }
    });
  }

  /**
   * Handle Disconnect
   * @description Handle the disconnect event for the Socket.IO Server
   * @author [thutasann](https://github.com/thutasann)
   */
  private handleDisconnect(socket: TypedSocket): void {
    socket.rooms.forEach((room) => {
      socket.leave(room);
    });
  }

  /**
   * Handle Client Events
   * @description Handle the client events for the Socket.IO Server
   * - Subscribe to a channel
   * - Unsubscribe from a channel
   * - Send a message to a channel
   */
  private handleClientEvents(socket: TypedSocket): void {
    socket.on('subscribe', (channel) => {
      socket.join(channel);
      logger.info(`Client ${socket.id} subscribed to ${channel}`);
    });

    socket.on('unsubscribe', (channel) => {
      socket.leave(channel);
      logger.info(`Client ${socket.id} unsubscribed from ${channel}`);
    });

    socket.on('message', (data) => {
      this.handleMessage(socket, data);
    });
  }

  /**
   * Handle Message
   * @description Handle the message event for the Socket.IO Server
   */
  private handleMessage(socket: TypedSocket, data: MessagePayload): void {
    try {
      const io = this.ensureIOInitialized();
      io.to(data.sender).emit('notification', {
        id: Date.now().toString(),
        type: 'info',
        message: data.content,
        timestamp: new Date(),
      });
    } catch (error) {
      socket.emit('error', {
        code: 'MESSAGE_ERROR',
        message: 'Failed to process message',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  /**
   * Start Socket Server
   * @description Start the Socket.IO Server
   */
  public start(): void {
    try {
      const io = this.ensureIOInitialized();
      io.on('connection', (socket: TypedSocket) => {
        logger.info(`New Client Connected: ${socket.id}`);

        this.handleClientEvents(socket);

        socket.on('disconnect', () => {
          logger.warning(`Client Disconnected: ${socket.id}`);
          this.handleDisconnect(socket);
        });
      });

      logger.success('Socket Initialized');
    } catch (error) {
      logger.error(`Socket Initialization Failed: ${error}`);
    }
  }

  /**
   * Emit to All
   * @description Emit to all clients
   * @param event - The event to emit
   * @param args - The arguments to emit
   * @example
   * this.socketService.emitToAll('notification', {
   *   id: Date.now().toString(),
   *   type: 'info',
   *   message: 'Hello, world!',
   *   timestamp: new Date(),
   * });
   */
  public emitToAll<T extends keyof ServerToClientEvents>(event: T, ...args: Parameters<ServerToClientEvents[T]>) {
    const io = this.ensureIOInitialized();
    io.emit(event, ...args);
  }

  /**
   * Emit to Specific Client
   * @description Emit to a specific client
   * @param socketId - The socket ID of the client to emit to
   * @param event - The event to emit
   * @param args - The arguments to emit
   * @example
   * this.socketService.emitToClient('123', 'notification', {
   *   id: Date.now().toString(),
   *   type: 'info',
   *   message: 'Hello, world!',
   *   timestamp: new Date(),
   * });
   */
  public emitToClient<T extends keyof ServerToClientEvents>(
    socketId: string,
    event: T,
    ...args: Parameters<ServerToClientEvents[T]>
  ): void {
    const io = this.ensureIOInitialized();
    io.to(socketId).emit(event, ...args);
  }

  /**
   * Get Connected Clients
   * @description Get the connected clients
   * @param room - The room to get the connected clients from
   * @returns The connected clients
   * @example
   * this.socketService.getConnectedClients('room1');
   */
  public async getConnectedClients(room?: string): Promise<string[]> {
    const io = this.ensureIOInitialized();
    if (room) {
      const sockets = await io.in(room).allSockets();
      return Array.from(sockets);
    }
    const sockets = await io.allSockets();
    return Array.from(sockets);
  }

  /**
   * Get Socket Instance by ID
   * @description Get the socket instance by ID
   * @param socketId - The socket ID of the client to get
   * @returns The socket instance
   * @example
   * this.socketService.getSocket('123');
   */
  public getSocket(socketId: string): TypedSocket | undefined {
    const io = this.ensureIOInitialized();
    return io.sockets.sockets.get(socketId) as TypedSocket;
  }

  /**
   * Get IO Instance
   * @description Get the IO instance
   * @returns The IO instance
   * @example
   * this.socketService.getIO();
   */
  public getIO(): TypedServer {
    return this.ensureIOInitialized();
  }

  /**
   * Emit to a specific room
   * @param room - Room ID (usually userId)
   * @param event - Event name
   * @param data - Event data
   */
  emitToRoom(room: string, event: any, data: any): void {
    this.io?.to(room).emit(event, data);
  }

  /**
   * Join a room
   * @param socketId - Socket ID
   * @param room - Room to join (usually userId)
   */
  joinRoom(socketId: string, room: string): void {
    const socket = this.io?.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(room);
    }
  }
}

/**
 * Socket Service Instance
 * @description Get the Socket Service instance
 */
export const socket = SocketService.getInstance();
