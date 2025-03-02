import { logger } from '../../shared/libraries/utils/logger';
import { WebhookSubscription } from '../../shared/types/webhooks/webhooks.base.type';
import { webhookSubscriptionModel } from '../models/webhooks-subscrption.model';

export class WebhookSubscriptionRepository {
  /**
   * Create Webhook Subscription
   * @param data - Webhook Subscription Data
   * @returns Webhook Subscription
   */
  static async createSubscription(data: Omit<WebhookSubscription, 'createdAt' | 'updatedAt'>) {
    try {
      const result = await webhookSubscriptionModel.create({
        ...data,
      });
      logger.success(`Created webhook subscription: ${result.name}`);
      return result;
    } catch (error) {
      logger.error(`Failed to create subscription : ${error}`);
      throw error;
    }
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
   * Find Active Subscriptions By Event Type
   * @description Find all active subscriptions that are listening for a specific event type
   */
  static async findActiveSubscriptionsByEventType(eventType: string): Promise<WebhookSubscription[]> {
    try {
      const subscriptions = await webhookSubscriptionModel
        .find({
          isActive: true,
          events: { $in: [eventType] },
        })
        .lean();

      logger.info(`Found ${subscriptions.length} active subscriptions for event type: ${eventType}`);
      return subscriptions;
    } catch (error) {
      logger.error(`Error finding active subscriptions for event type ${eventType}: ${error}`);
      throw error;
    }
  }

  /**
   * Update Webhook Subscription
   * @param id - Webhook Subscription ID
   * @param data - Webhook Subscription Data
   * @returns Webhook Subscription
   */
  static async updateSubscription(id: string, data: Partial<WebhookSubscription>) {
    try {
      const subscription = await webhookSubscriptionModel.findByIdAndUpdate(
        id,
        {
          $set: {
            ...data,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );

      if (subscription) {
        logger.success(`Updated webhook subscription: ${id}`);
      } else {
        logger.warning(`Webhook subscription not found: ${id}`);
      }

      return subscription;
    } catch (error) {
      logger.error(`Error updating webhook subscription ${id}: ${error}`);
      throw error;
    }
  }

  /**
   * Find Active Subscription By Event
   * @param eventType - Event Type
   */
  static async findActiveSubscrptionsByEvent(eventType: string): Promise<WebhookSubscription[]> {
    try {
      return await webhookSubscriptionModel
        .find({
          events: eventType,
          isActive: true,
        })
        .lean();
    } catch (error) {
      logger.error(`Failed to find active Subscription : ${error}`);
      throw error;
    }
  }

  /**
   * Find By Id
   */
  static async findById(id: string): Promise<WebhookSubscription | null> {
    try {
      return await webhookSubscriptionModel.findById(id).lean();
    } catch (error) {
      logger.error(`Error finding webhook subscription ${id}: ${error}`);
      throw error;
    }
  }

  /**
   * Find Active Subscriptions By Client
   */
  static async findActiveSubscriptionsByClient(clientId: string): Promise<WebhookSubscription[]> {
    try {
      return await webhookSubscriptionModel
        .find({
          clientId,
          isActive: true,
        })
        .lean();
    } catch (error) {
      logger.error(`Error finding active subscriptions for client ${clientId}: ${error}`);
      throw error;
    }
  }

  /**
   * Deactivate Subscription
   */
  static async deactivateSubscription(id: string): Promise<WebhookSubscription | null> {
    try {
      return await webhookSubscriptionModel.findByIdAndUpdate(
        id,
        {
          $set: {
            isActive: false,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );
    } catch (error) {
      logger.error(`Error deactivating webhook subscription ${id}: ${error}`);
      throw error;
    }
  }

  /**
   * Add Events To Subscription
   */
  static async addEventsToSubscription(id: string, events: string[]): Promise<WebhookSubscription | null> {
    try {
      return await webhookSubscriptionModel.findByIdAndUpdate(
        id,
        {
          $addToSet: { events: { $each: events } }, // Use $addToSet to avoid duplicates
          $set: { updatedAt: new Date() },
        },
        { new: true }
      );
    } catch (error) {
      logger.error(`Error adding events to webhook subscription ${id}: ${error}`);
      throw error;
    }
  }

  /**
   * Remove Events From Subscription
   */
  static async removeEventsFromSubscription(id: string, events: string[]): Promise<WebhookSubscription | null> {
    try {
      return await webhookSubscriptionModel.findByIdAndUpdate(
        id,
        {
          $pull: { events: { $in: events } },
          $set: { updatedAt: new Date() },
        },
        { new: true }
      );
    } catch (error) {
      logger.error(`Error removing events from webhook subscription ${id}: ${error}`);
      throw error;
    }
  }
}
