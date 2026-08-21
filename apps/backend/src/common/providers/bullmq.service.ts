import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue, QueueOptions, Worker } from 'bullmq';

@Injectable()
export class BullmqService implements OnModuleDestroy {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  private getQueueOptions(): QueueOptions {
    return {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
      },
    };
  }

  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, this.getQueueOptions());
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  addJob<T>(queueName: string, jobName: string, data: T, opts?: any) {
    const queue = this.getQueue(queueName);
    return queue.add(jobName, data, opts);
  }

  async getJob(queueName: string, jobId: string) {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    return job;
  }

  processQueue(queueName: string, processor: string | ((job: any) => Promise<any>)) {
    if (this.workers.has(queueName)) {
      return this.workers.get(queueName)!;
    }

    const worker = new Worker(queueName, processor, this.getQueueOptions());
    this.workers.set(queueName, worker);
    return worker;
  }

  async closeQueue(queueName: string) {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.close();
      this.queues.delete(queueName);
    }
  }

  async onModuleDestroy() {
    const closePromises = Array.from(this.queues.values()).map((q) => q.close());
    const workerPromises = Array.from(this.workers.values()).map((w) => w.close());
    await Promise.all([...closePromises, ...workerPromises]);
  }
}