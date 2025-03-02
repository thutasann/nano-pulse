import mongoose, { Document, Schema } from 'mongoose';
import { WebhookDeliverySchema } from '../../core/zod-schemas/webhooks/webhooks.schema';
import { WebhookDelivery } from '../../shared/types/webhooks/webhooks.base.type';

/**
 * Webhook Delivery Mongoose Document
 */
export interface WebhookDeliveryDocument extends WebhookDelivery, Document {}

/**
 * Webhook Delivery Collection Name
 */
export const WebhookDeliveryCollectionName = 'webhook_delivery';

/**
 * Webhook Delivery Mongoose Schema
 */
const webhookDeliverySchema = new Schema<WebhookDeliveryDocument>(
  {
    webhookId: { type: String, required: true, index: true },
    eventId: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: WebhookDeliverySchema.shape.status._def.values,
      default: 'pending',
      required: true,
    },
    statusCode: Number,
    response: String,
    error: String,
    attemptCount: { type: Number, default: 0 },
    nextRetryAt: Date,
  },
  {
    timestamps: true,
    validateBeforeSave: true,
    collection: WebhookDeliveryCollectionName,
  }
);

webhookDeliverySchema.pre('save', async function (next) {
  try {
    await WebhookDeliverySchema.parseAsync(this.toObject());
    next();
  } catch (error: any) {
    next(error);
  }
});

export const WebhookDeliveryModel = mongoose.model<WebhookDeliveryDocument>(
  WebhookDeliveryCollectionName,
  webhookDeliverySchema
);
