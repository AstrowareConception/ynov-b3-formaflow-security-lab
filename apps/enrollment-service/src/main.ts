import 'reflect-metadata';
import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import amqp from 'amqplib';
import { Pool, type PoolClient } from 'pg';

async function connectRabbit(url: string) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    try { return await amqp.connect(url); } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw lastError;
}

@Controller()
class HealthController {
  @Get('/health') health() { return { status: 'ok', service: 'enrollment-service' }; }
}
@Module({ controllers: [HealthController] })
class EnrollmentModule {}

async function bootstrap() {
  const app = await NestFactory.create(EnrollmentModule);
  const connection = await connectRabbit(process.env.RABBITMQ_URL!);
  const channel = await connection.createChannel();
  await channel.assertExchange('formaflow.events', 'topic', { durable: true });
  const queue = await channel.assertQueue('enrollment.account-deletion', { durable: true });
  await channel.bindQueue(queue.queue, 'formaflow.events', 'account.deletion.requested.v1');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, statement_timeout: 2_000 });
  await channel.consume(queue.queue, async (message) => {
    if (!message) return;
    let client: PoolClient | undefined;
    try {
      const event = JSON.parse(message.content.toString()) as { data: { userId: string } };
      client = await pool.connect();
      await client.query('BEGIN');
      await client.query("UPDATE enrollments SET status='erasure-requested' WHERE user_id=$1", [event.data.userId]);
      await client.query('DELETE FROM notifications WHERE user_id=$1', [event.data.userId]);
      await client.query('UPDATE consents SET withdrawn_at=COALESCE(withdrawn_at,now()) WHERE user_id=$1', [event.data.userId]);
      await client.query('COMMIT');
      channel.ack(message);
    } catch {
      await client?.query('ROLLBACK').catch(() => undefined);
      channel.nack(message, false, false);
    } finally {
      client?.release();
    }
  });
  await app.listen(Number(process.env.PORT ?? 3001), '0.0.0.0');
}
void bootstrap();
