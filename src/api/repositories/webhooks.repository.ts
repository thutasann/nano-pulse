import { WebhookDeliverySchema, WebhookSubscriptionSchema } from '../../core/zod-schemas/webhooks/webhooks.schema';
import { WebhookDelivery, WebhookSubscription } from '../../shared/types/webhooks/webhooks.base.type';
import { WebhookDeliveryModel } from '../models/webhooks-delivery.model';
import { webhookSubscriptionModel } from '../models/webhooks-subscrption.model';

export abstract class WebhookRepository {
  static async createSubscrption(data: Omit<WebhookSubscription, 'createdAt' | 'updatedAt'>) {
    const validated = await WebhookSubscriptionSchema.parseAsync(data);
    return webhookSubscriptionModel.create(validated);
  }

  static async createDelivery(data: Omit<WebhookDelivery, 'createdAt' | 'updatedAt'>) {
    const validated = await WebhookDeliverySchema.parseAsync(data);
    return WebhookDeliveryModel.create(validated);
  }

  static async findSubscriptionById(id: string) {
    return webhookSubscriptionModel.findById(id);
  }

  static async findActiveSubscriptions() {
    return webhookSubscriptionModel.find({ isActive: true });
  }

  static async updateSubscription(id: string, data: Partial<WebhookSubscription>) {
    const validated = await WebhookSubscriptionSchema.partial().parseAsync(data);
    return webhookSubscriptionModel.findByIdAndUpdate(id, validated, { new: true });
  }
}
