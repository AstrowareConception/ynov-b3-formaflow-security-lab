import { randomUUID } from 'node:crypto';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import amqp, { type ChannelModel, type Channel } from 'amqplib';
import type { LabEvent } from '../../../packages/contracts/src';

@Injectable()
export class EventBus implements OnModuleDestroy {
  private connection?: ChannelModel;
  private channel?: Channel;

  private async getChannel(): Promise<Channel> {
    if (this.channel) return this.channel;
    const url = process.env.RABBITMQ_URL;
    if (!url) throw new Error('RABBITMQ_URL absent');
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange('formaflow.events', 'topic', { durable: true });
    return this.channel;
  }

  async publish<T extends Record<string, unknown>>(eventType: string, data: T) {
    const event: LabEvent<T> = {
      eventId: randomUUID(), eventType, eventVersion: 1,
      occurredAt: new Date().toISOString(), correlationId: randomUUID(), data,
    };
    const channel = await this.getChannel();
    channel.publish('formaflow.events', eventType, Buffer.from(JSON.stringify(event)), {
      contentType: 'application/json', persistent: true,
    });
    return event;
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
