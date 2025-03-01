/**
 * Webhook Delivery Payload
 */
export type DeliveryPayload = {
  id: string;
  event: {
    type: string;
    payload: any;
  };
  subscription: {
    url: string;
    secret: string;
    retryConfig: {
      maxRetries: number;
      retryInterval: number;
    };
  };
  signature: string;
  timestamp: Date;
  attempts: number;
};
