import { WebhookDeliverySchema, WebhookSubscriptionSchema } from '../../core/zod-schemas/webhooks/webhooks.schema';
import { WebhookDelivery, WebhookSubscription } from '../../shared/types/webhooks/webhooks.base.type';
import { WebhookDeliveryModel } from '../models/webhooks-delivery.model';
import { webhookSubscriptionModel } from '../models/webhooks-subscrption.model';

export abstract class WebhookRepository {
  /**
   * Create Webhook Subscription
   * @param data - Webhook Subscription Data
   * @returns Webhook Subscription
   */
  static async createSubscrption(data: Omit<WebhookSubscription, 'createdAt' | 'updatedAt'>) {
    const validated = await WebhookSubscriptionSchema.parseAsync(data);
    return webhookSubscriptionModel.create(validated);
  }

  /**
   * Create Webhook Delivery
   * @param data - Webhook Delivery Data
   * @returns Webhook Delivery
   */
  static async createDelivery(data: Omit<WebhookDelivery, 'createdAt' | 'updatedAt'>) {
    const validated = await WebhookDeliverySchema.parseAsync(data);
    return WebhookDeliveryModel.create(validated);
  }

  /**
   * Find Webhook Subscription by ID
   * @param id - Webhook Subscription ID
   * @returns Webhook Subscription
   */
  static async findSubscriptionById(id: string) {
    return webhookSubscriptionModel.findById(id);
  }

  /**
   * Find Active Webhook Subscriptions
   * @returns Webhook Subscriptions
   */
  static async findActiveSubscriptions() {
    return webhookSubscriptionModel.find({ isActive: true });
  }

  /**
   * Find Failed Webhook Deliveries
   * @returns Webhook Deliveries
   */
  static async findFailedDeliveries() {
    return WebhookDeliveryModel.find({ status: 'failed' });
  }

  /**
   * Update Webhook Subscription
   * @param id - Webhook Subscription ID
   * @param data - Webhook Subscription Data
   * @returns Webhook Subscription
   */
  static async updateSubscription(id: string, data: Partial<WebhookSubscription>) {
    const validated = await WebhookSubscriptionSchema.partial().parseAsync(data);
    return webhookSubscriptionModel.findByIdAndUpdate(id, validated, { new: true });
  }
}
