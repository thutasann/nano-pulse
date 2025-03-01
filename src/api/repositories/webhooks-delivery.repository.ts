import { Types } from 'mongoose';
import { logger } from '../../shared/libraries/utils/logger';
import { WebhookDelivery } from '../../shared/types/webhooks/webhooks.base.type';
import { WebhookDeliveryModel } from '../models/webhooks-delivery.model';

export abstract class WebhookDeliveryRepository {
  /**
   * Create Webhook Delivery
   * @param data - Webhook Delivery Data
   * @returns Webhook Delivery
   */
  static async createDelivery(data: Omit<WebhookDelivery, 'createdAt' | 'updatedAt'>) {
    try {
      const result = await WebhookDeliveryModel.create({
        ...data,
        _id: new Types.ObjectId(),
      });
      return result;
    } catch (error) {
      logger.error(`Failed to create delivery record: ${error}`);
    }
  }

  /**
   * Find Delivery By ID
   * @param deliveryId - delivery Id
   * @returns Webhook Delivery
   */
  static async findDeliveryById(deliveryId: string) {
    try {
      return await WebhookDeliveryModel.findById(deliveryId).lean();
    } catch (error) {
      logger.error(`Failed to find delivery by ID: ${error}`);
      throw error;
    }
  }

  /**
   * Update Delivery Status
   * @param deliveryId - delivery Id
   * @param status - status
   * @param data - webhook delivery data
   */
  static async updateDeliveryStatus(
    deliveryId: string,
    status: WebhookDelivery['status'],
    data: Partial<WebhookDelivery>
  ) {
    try {
      return await WebhookDeliveryModel.findByIdAndUpdate(
        deliveryId,
        {
          $set: {
            status,
            ...data,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );
    } catch (error) {
      logger.error(`Failed to update delivery status : ${error}`);
      throw error;
    }
  }

  /**
   * Find Failed Webhook Deliveries
   * @returns Webhook Deliveries
   */
  static async findFailedDeliveries() {
    try {
      return WebhookDeliveryModel.find({
        status: 'failed',
        attemptCount: { $lt: 5 },
        nextRetryAt: { $lte: new Date() },
      })
        .sort({ nextRetryAt: 1 })
        .limit(100)
        .lean();
    } catch (error) {
      logger.error(`Failed to find failed deliveries : ${error}`);
      throw error;
    }
  }

  /**
   * Get Delivery Analytics
   * @param subscriptionId - subscription Id
   */
  static async getDeliveryAnalytics(subscriptionId: string) {
    try {
      const [totalDeliveries, successfulDeliveries, failedDeliveries, pendingDeliveries] = await Promise.all([
        WebhookDeliveryModel.countDocuments({ webhookId: subscriptionId }),
        WebhookDeliveryModel.countDocuments({ webhookId: subscriptionId, status: 'success' }),
        WebhookDeliveryModel.countDocuments({ webhookId: subscriptionId, status: 'failed' }),
        WebhookDeliveryModel.countDocuments({ webhookId: subscriptionId, status: 'pending' }),
      ]);

      const avgResponseTime = await WebhookDeliveryModel.aggregate([
        { $match: { webhookId: subscriptionId, status: 'success' } },
        {
          $group: {
            _id: null,
            avgTime: {
              $avg: {
                $subtract: ['$updatedAt', '$createdAt'],
              },
            },
          },
        },
      ]);

      return {
        total: totalDeliveries,
        successful: successfulDeliveries,
        failed: failedDeliveries,
        pending: pendingDeliveries,
        successRate: (successfulDeliveries / totalDeliveries) * 100,
        averageResponseTime: avgResponseTime[0]?.avgTime || 0,
      };
    } catch (error) {
      logger.error(`Failed to get delivery analytics: ${error}`);
      throw error;
    }
  }

  /**
   * Get Recent Deliveries
   * @param subscriptionId - subscription Id
   * @param limit - limit
   */
  static async getRecentDeliveries(subscriptionId: string, limit: number = 10) {
    try {
      return await WebhookDeliveryModel.find({ webhookId: subscriptionId }).sort({ creatdAt: -1 }).limit(limit).lean();
    } catch (error) {
      logger.error(`Failed to get recent deliveries : ${error}`);
      throw error;
    }
  }

  /**
   * Get Delivery By ID
   */
  static async getDeliveryById(id: string): Promise<WebhookDelivery | null> {
    try {
      return await WebhookDeliveryModel.findById(id).lean();
    } catch (error) {
      logger.error(`Failed to get delivery by ID: ${error}`);
      throw error;
    }
  }
}
