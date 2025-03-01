import { Request, Response } from 'express';
import { ResponseHandler } from '../../shared/libraries/utils/response-handler.util';
import { WebhooksService } from '../services/webhooks.service';

export class WebhooksController {
  private webhookService: WebhooksService;

  constructor() {
    this.webhookService = WebhooksService.getInstance();
    this.triggerEvent = this.triggerEvent.bind(this);
    this.getStats = this.getStats.bind(this);
    this.retryWebhook = this.retryWebhook.bind(this);
  }

  /**
   * Trigger Event
   * @param req - request
   * @param res - response
   */
  async triggerEvent(req: Request, res: Response) {
    try {
      const result = await this.webhookService.processWebhookEvent({
        ...req.body,
        metadata: {
          timestamp: new Date(),
          clientId: req?.client?.apiKey,
          source: 'api',
        },
      });
      ResponseHandler.success(res, result);
    } catch (error) {
      ResponseHandler.error(res, 'Failed to trigger event', 500, error);
    }
  }

  /**
   * Get Webhook Stats
   */
  async getStats(req: Request, res: Response) {
    try {
      const stats = await this.webhookService.getWebhookStats(req.params.subscriptionId);
      ResponseHandler.success(res, stats, 'Webhook stats retrieved successfully');
    } catch (error) {
      ResponseHandler.error(res, 'Failed to get webhook stats', 500, error);
    }
  }

  /**
   * Retry Failed Webhook
   */
  async retryWebhook(req: Request, res: Response) {
    try {
      const result = await this.webhookService.retryFailedWebhook(req.params.deliveryId);
      ResponseHandler.success(res, result, 'Webhook retry initiated');
    } catch (error) {
      ResponseHandler.error(res, 'Failed to retry webhook', 500, error);
    }
  }
}
