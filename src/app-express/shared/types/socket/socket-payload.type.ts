/**
 * Notification Payload
 * @description Notification payload
 * @author [thutasann](https://github.com/thutasann)
 */
export type NotificationPayload = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
};

/**
 * Error Payload
 * @description Error payload
 * @author [thutasann](https://github.com/thutasann)
 */
export type ErrorPayload = {
  code: string;
  message: string;
  details?: Record<string, any>;
};

/**
 * Status Payload
 * @description Status payload
 * @author [thutasann](https://github.com/thutasann)
 */
export type StatusPayload = {
  type: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
};

/**
 * Message Payload
 * @description Message payload
 * @author [thutasann](https://github.com/thutasann)
 */
export type MessagePayload = {
  id: string;
  content: string;
  timestamp: Date;
  sender: string;
};
