import { Server, Socket } from 'socket.io';
import { ErrorPayload, MessagePayload, NotificationPayload, StatusPayload } from './socket-payload.type';

/**
 * Server to Client Events
 * @description Server to Client events
 * @todo Add more server to client events
 * @author [thutasann](https://github.com/thutasann)
 */
export interface ServerToClientEvents {
  notification: (data: NotificationPayload) => void;
  error: (error: ErrorPayload) => void;
  statusUpdate: (status: StatusPayload) => void;
}

/**
 * Client to Server Events
 * @description Client to Server events
 * @todo Add more client to server events
 * @author [thutasann](https://github.com/thutasann)
 */
export interface ClientToServerEvents {
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  message: (data: MessagePayload) => void;
}

/**
 * Inter-Server Events
 * @description Inter-Server events
 * @todo Add more inter-server events
 * @author [thutasann](https://github.com/thutasann)
 */
export interface InterServerEvents {
  ping: () => void;
  broadcast: (event: string, data: any) => void;
}

/**
 * Socket Data
 * @description Socket data
 * @todo Add more socket data properties
 * @author [thutasann](https://github.com/thutasann)
 */
export interface SocketData {
  userId: string;
  username: string;
  connectedAt: Date;
}

/**
 * Typed Server
 * @description Typed Server that extends the Socket.IO Server with
 * - Client to Server Events
 * - Server to Client Events
 * - Inter Server Events
 * @author [thutasann](https://github.com/thutasann)
 */
export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

/**
 * Typed Socket
 * @description Typed Server that extends the Socket.IO Server with
 * - Client to Server Events
 * - Server to Client Events
 * - Inter Server Events
 * - Socket Data
 * @author [thutasann](https://github.com/thutasann)
 */
export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
