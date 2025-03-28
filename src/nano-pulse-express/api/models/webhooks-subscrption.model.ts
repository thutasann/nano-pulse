import mongoose, { Document, Schema } from 'mongoose';
import {
  WebhookSubscriptionPrioritySchema,
  WebhookSubscriptionSchema,
} from '../../core/zod-schemas/webhooks/webhooks.schema';
import { zodToMongoose } from '../../shared/libraries/zod/zod-to-mongoose';
import { WebhookSubscription } from '../../shared/types/webhooks/webhooks.base.type';

/**
 * Webhook Subscrption Mongoose Document
 */
export interface WebhookSubscriptionDocument extends WebhookSubscription, Document {}

/**
 * Webhook Subscrption Collection Name
 */
export const WebhookSubscriptionCollectionName = 'webhook_subscription';

/**
 * Webhook Subscrption Mongoose Schema
 */
const webhookSubscriptionSchema = new Schema<WebhookSubscriptionDocument>(
  {
    clientId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: String,
    url: { type: String, required: true },
    events: [{ type: String, required: true }],
    secret: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    priority: { type: String, enum: WebhookSubscriptionPrioritySchema._def.values, required: true },
    retryConfig: {
      type: zodToMongoose(WebhookSubscriptionSchema.shape.retryConfig),
      required: true,
      _id: false,
    },
    rateLimit: {
      type: zodToMongoose(WebhookSubscriptionSchema.shape.rateLimit),
      required: true,
      _id: false,
    },
  },
  {
    timestamps: true,
    validateBeforeSave: true,
    collection: WebhookSubscriptionCollectionName,
  }
);

webhookSubscriptionSchema.pre('save', async function (next) {
  try {
    await WebhookSubscriptionSchema.parseAsync(this.toObject());
    next();
  } catch (error: any) {
    next(error);
  }
});

export const webhookSubscriptionModel = mongoose.model<WebhookSubscriptionDocument>(
  WebhookSubscriptionCollectionName,
  webhookSubscriptionSchema
);
