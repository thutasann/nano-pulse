import cluster, { Worker } from 'cluster';
import os from 'os';
import { logger } from './utils/logger';

/**
 * Cluster Service
 * @description This service is used to manage the cluster of workers
 * - It will create a new worker if the current worker dies
 * - It will replace the dead worker with a new worker
 * - It will also handle the graceful shutdown of the workers
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
export class ClusterService {
  private static instance: ClusterService;
  private readonly numCPUs: number;
  private workers: Map<number, Worker>;

  private constructor() {
    this.numCPUs = os.cpus().length;
    this.workers = new Map();
  }

  /**
   * Get Instance
   * @returns {ClusterService}
   */
  public static getInstance(): ClusterService {
    if (!ClusterService.instance) {
      ClusterService.instance = new ClusterService();
    }
    return ClusterService.instance;
  }

  /**
   * Setup Worker Process
   * @param {Worker} worker
   */
  private setupWorkerProcess(worker: Worker): void {
    this.workers.set(worker.id, worker);

    worker.on('message', (message) => {
      logger.info(`[Cluster] Message from worker : ${worker.id} : ${JSON.stringify(message)}`);
      this.workers.delete(worker.id);
    });

    worker.on('exit', (code, signal) => {
      logger.warning(`[Cluster] Worker ${worker.id} died. Code : ${code}, Signal : ${signal}`);
      this.workers.delete(worker.id);

      /** replace the dead worker */
      const newWorker = cluster.fork();
      this.setupWorkerProcess(newWorker);
    });
  }

  /**
   * Initialize Cluster
   * @description This method will initialize the cluster of workers
   * - It will create a new worker if the current worker dies
   * - It will replace the dead worker with a new worker
   * - It will also handle the graceful shutdown of the workers
   */
  public initialize(): void {
    if (cluster.isPrimary) {
      logger.info(`[Cluster] Primary ${process.pid} is running..`);
      logger.info(`[Cluster] Starting ${this.numCPUs} workers..`);

      for (let i = 0; i < this.numCPUs; i++) {
        const worker = cluster.fork();
        this.setupWorkerProcess(worker);
      }

      cluster.on('exit', (worker, code, signal) => {
        logger.warning(`Worker ${worker.process.pid} died. Code: ${code}, Signal: ${signal}`);
      });
    }
  }

  /**
   * Get Active Workers
   * @returns {number}
   */
  public getActiveWorkers(): number {
    return this.workers.size;
  }

  /**
   * Graceful Shutdown
   * @returns {Promise<void>}
   */
  public async gracefulShutdown(): Promise<void> {
    if (cluster.isPrimary) {
      logger.info('[Cluster] Shutting down workers...');

      const shutdownPromises = Array.from(this.workers.values()).map((worker) => {
        return new Promise<void>((resolve) => {
          worker.on('exit', () => resolve());
          worker.send('shutdown');
        });
      });

      await Promise.all(shutdownPromises);
      logger.info('[Cluster] All workers shut down successfully');
    }
  }
}
